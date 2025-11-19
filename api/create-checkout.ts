// api/create-checkout.ts — Vercel Edge
// Objectif: créer le checkout Lemon uniquement (aucun appel Sellsy ici)

export const config = { runtime: "edge" };

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

const j = (obj: any, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS, ...extra },
  });

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("Not found", { status: 404, headers: CORS });

  const HDR: Record<string, string> = { "x-handler": "vercel", "x-stage": "" };

  try {
    HDR["x-stage"] = "parse-body";
    // On accepte sellsy_estimate_id en option pour le récupérer dans le webhook
    // On accepte aussi accepted_cgv et (optionnel) cgv_version
    const body = await req.json();
    const {
      total_cents,
      email,
      sellsy_estimate_id,
      accepted_cgv,
      cgv_version,
    } = body ?? {};

    if (!Number.isFinite(Number(total_cents)) || Number(total_cents) <= 0) {
      return j({ error: "total_cents invalide" }, 400, HDR);
    }
    const totalCents = Math.round(Number(total_cents));

    // Vérifier que les CGV ont été acceptées (contrôle serveur indispensable)
    if (accepted_cgv !== true) {
      return j({ error: "accepted_cgv_required", message: "Les conditions générales doivent être acceptées." }, 400, HDR);
    }

    // (Optionnel) valider le format de l'email
    if (!email || !/^\S+@\S+\.\S+$/.test(String(email))) {
      return j({ error: "invalid_email", message: "Email invalide ou absent." }, 400, HDR);
    }

    HDR["x-stage"] = "read-env";
    const API_KEY = process.env.LEMON_API_KEY || "";
    const VARIANT_ID = process.env.LEMON_VARIANT_ID || "";
    const STORE_ID = process.env.LEMON_STORE_ID || "";       // <- ajoute ça dans tes env Vercel
    const TEST_MODE = (process.env.LEMON_TEST_MODE ?? "true").toLowerCase() === "true";

    if (!API_KEY || !VARIANT_ID || !STORE_ID) {
      return j(
        { error: "missing_env_vars", need: ["LEMON_API_KEY", "LEMON_VARIANT_ID", "LEMON_STORE_ID"] },
        500,
        HDR
      );
    }

    // --- Build checkout_data
    // On préfère horodater côté serveur pour éviter les falsifications
    const checkout_data: Record<string, any> = {
      email: String(email || ""),
      accepted_cgv: true,
      accepted_cgv_at: new Date().toISOString(),
    };
    if (sellsy_estimate_id) checkout_data.sellsy_estimate_id = String(sellsy_estimate_id);
    if (cgv_version) checkout_data.cgv_version = String(cgv_version);

    HDR["x-stage"] = "create-checkout";
    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          custom_price: totalCents,       // en cents
          test_mode: TEST_MODE,
          checkout_data,
        },
        relationships: {
          store:   { data: { type: "stores",   id: STORE_ID } },
          variant: { data: { type: "variants", id: VARIANT_ID } },
        },
      },
    };

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const txt = await res.text();
    let json: any = null;
    try { json = JSON.parse(txt); } catch {}

    if (!res.ok) {
      // On remonte l’erreur Lemon telle quelle pour debug (visible avec ?debug=1 côté UI)
      return j({ error: "lemon_failed", status: res.status, details: json || txt }, 500, HDR);
    }

    const url = json?.data?.attributes?.url;
    if (!url) return j({ error: "no_url_from_checkout", details: json }, 500, HDR);

    HDR["x-stage"] = "done";
    return j({ url }, 200, HDR);
  } catch (e: any) {
    return j({ error: "server_error", details: String(e?.message || e) }, 500, HDR);
  }
}

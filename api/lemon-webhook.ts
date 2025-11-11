// api/lemon-webhook.ts
export default async function handler(req: any, res: any) {
  // Lemon envoie en POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // ---- (Optionnel) vérif simple par token custom pendant les tests ----
  // Si tu veux forcer un header custom au lieu de la signature Lemon :
  const expected = process.env.LEMON_WEBHOOK_TOKEN || "";
  const got = req.headers["x-vitalpet-token"] as string | undefined;
  if (expected) {
    if (!got || got !== expected) {
      // On log mais on répond 200 pour arrêter les croix rouges dans Lemon
      console.warn("lemon-webhook: bad x-vitalpet-token");
      return res.status(200).json({ ok: true, forwarded: false, reason: "bad token" });
    }
  }

  // ----- Lecture body JSON sûre -----
  async function readJsonBody() {
    if (req.body && typeof req.body === "object") return req.body;
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return {};
    }
  }

  try {
    const payload = await readJsonBody();

    // On récupère les champs utiles (email surtout)
    const data = payload?.data || {};
    const attributes = data?.attributes || {};
    // Email côté order / checkout
    const email =
      attributes?.user_email ||
      attributes?.email ||
      attributes?.customer_email ||
      "";

    // Si pas d'email, on tente dans relationships.customer / user…
    let safeEmail = String(email || "").trim().toLowerCase();

    // Si tu veux journaliser en preview seulement
    if (process.env.NODE_ENV !== "production") {
      console.log("lemon-webhook in:", {
        type: data?.type,
        id: data?.id,
        email: safeEmail,
      });
    }

    // Si on n’a pas d’email → on ack quand même (pour éviter les retry infinis),
    // mais on ne forward pas
    if (!safeEmail) {
      return res.status(200).json({
        ok: true,
        forwarded: false,
        reason: "no email in webhook",
      });
    }

    // ---- Forward interne vers Sellsy (create_contact only) ----
    // On ne touche pas au flux de devis/facture existant.
    const baseUrl =
  process.env.SELF_BASE_URL ||
  "https://vitalpetfrance.com" || // ton domaine custom
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "http://localhost:3000";


    const fwd = await fetch(`${baseUrl}/api/sellsy-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "create_contact",
        payload: {
          email: safeEmail,
          first_name: attributes?.user_name || attributes?.first_name || "",
          last_name: attributes?.last_name || "",
          phone: attributes?.user_phone || "",
        },
      }),
    });

    const fwdTxt = await fwd.text();
    if (process.env.NODE_ENV !== "production") {
      console.log("sellsy-sync <- webhook:", fwd.status, fwdTxt.slice(0, 300));
    }

    // On répond 200 quoi qu’il arrive pour stopper les croix rouges Lemon
    return res.status(200).json({ ok: true, forwarded: true });
  } catch (e: any) {
    console.error("lemon-webhook error:", e?.message || e);
    // On répond 200 quand même pour éviter les retry agressifs de Lemon
    return res.status(200).json({ ok: true, forwarded: false, error: "handled" });
  }
}

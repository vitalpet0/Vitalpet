// api/create-checkout.ts — Vercel Edge
// Flow: variant -> product (via id OU via /variants/:id/product) -> store -> create checkout

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
    // On accepte maintenant sellsy_estimate_id en option
    const { total_cents, email, sellsy_estimate_id } = await req.json();
    if (!Number.isFinite(total_cents) || total_cents <= 0) {
      return j({ error: "total_cents invalide" }, 400, HDR);
    }

    HDR["x-stage"] = "read-env";
    const API_KEY = process.env.LEMON_API_KEY!;
    const VARIANT_ID = process.env.LEMON_VARIANT_ID!;
    if (!API_KEY || !VARIANT_ID) {
      return j({ error: "missing_env_vars", need: ["LEMON_API_KEY", "LEMON_VARIANT_ID"] }, 500, HDR);
    }

    // 1) Variant -> product
    HDR["x-stage"] = "variant-lookup";
    const vRes = await fetch(`https://api.lemonsqueezy.com/v1/variants/${VARIANT_ID}`, {
      headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${API_KEY}` },
    });
    const vTxt = await vRes.text();
    let vJson: any = null;
    try { vJson = JSON.parse(vTxt); } catch {}
    if (!vRes.ok) {
      return j({ error: "variant_lookup_failed", status: vRes.status, details: vJson || vTxt }, 500, HDR);
    }

    let productId: string | null =
      vJson?.data?.relationships?.product?.data?.id ?? null;

    // Si l'id n'est pas présent, suis le lien /variants/:id/product
    if (!productId) {
      const relatedProductUrl = vJson?.data?.relationships?.product?.links?.related;
      if (typeof relatedProductUrl === "string" && relatedProductUrl.includes("/variants/")) {
        HDR["x-stage"] = "variant-product-related";
        const vpRes = await fetch(relatedProductUrl, {
          headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${API_KEY}` },
        });
        const vpTxt = await vpRes.text();
        let vpJson: any = null;
        try { vpJson = JSON.parse(vpTxt); } catch {}
        if (!vpRes.ok) {
          return j({ error: "variant_product_fetch_failed", status: vpRes.status, details: vpJson || vpTxt }, 500, HDR);
        }
        // Normalement data.type === "products"
        productId = vpJson?.data?.id ?? null;
        if (!productId) {
          return j({ error: "product_id_not_found_from_variant", details: vpJson }, 500, HDR);
        }
      } else {
        return j({ error: "product_id_not_found_from_variant", details: vJson }, 500, HDR);
      }
    }

    // 2) Product -> store
    HDR["x-stage"] = "product-lookup";
    const pRes = await fetch(`https://api.lemonsqueezy.com/v1/products/${productId}`, {
      headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${API_KEY}` },
    });
    const pTxt = await pRes.text();
    let pJson: any = null;
    try { pJson = JSON.parse(pTxt); } catch {}
    if (!pRes.ok) {
      return j({ error: "product_lookup_failed", status: pRes.status, details: pJson || pTxt }, 500, HDR);
    }

    let storeId: string | null = pJson?.data?.relationships?.store?.data?.id ?? null;

    // Si l'id n'est pas présent sur le product, suis le lien du store
    if (!storeId) {
      const relatedStoreUrl = pJson?.data?.relationships?.store?.links?.related;
      if (typeof relatedStoreUrl === "string") {
        HDR["x-stage"] = "product-store-related";
        const sRes = await fetch(relatedStoreUrl, {
          headers: { Accept: "application/vnd.api+json", Authorization: `Bearer ${API_KEY}` },
        });
        const sTxt = await sRes.text();
        let sJson: any = null;
        try { sJson = JSON.parse(sTxt); } catch {}
        if (!sRes.ok) {
          return j({ error: "store_lookup_failed", status: sRes.status, details: sJson || sTxt }, 500, HDR);
        }
        storeId = sJson?.data?.id ?? null;
      }
    }

    if (!storeId) {
      return j({ error: "store_id_not_found_from_product", details: pJson }, 500, HDR);
    }

    // 3) Create checkout
    HDR["x-stage"] = "create-checkout";

    // Prépare checkout_data en incluant sellsy_estimate_id si fourni
    const checkoutData: Record<string, any> = { email: email || "" };
    if (sellsy_estimate_id) {
      // on force en string pour éviter les problèmes de typage
      checkoutData.sellsy_estimate_id = String(sellsy_estimate_id);
    }

    const payload = {
      data: {
        type: "checkouts",
        attributes: {
          custom_price: total_cents,           // cents (prix variable)
          test_mode: true,                     // garde true tant que ton app est en review
          checkout_data: checkoutData,
        },
        relationships: {
          store:   { data: { type: "stores",   id: String(storeId) } },
          variant: { data: { type: "variants", id: String(VARIANT_ID) } },
        },
      },
    };

    const cRes = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    const cTxt = await cRes.text();
    let cJson: any = null;
    try { cJson = JSON.parse(cTxt); } catch {}
    if (!cRes.ok) {
      return j({ error: "lemon_failed", status: cRes.status, details: cJson || cTxt }, 500, HDR);
    }

    const url = cJson?.data?.attributes?.url;
    if (!url) return j({ error: "no_url_from_checkout", details: cJson }, 500, HDR);

    HDR["x-stage"] = "done";
    return j({ url }, 200, HDR);
  } catch (e: any) {
    return j({ error: "server_error", details: String(e?.message || e) }, 500, HDR);
  }
}

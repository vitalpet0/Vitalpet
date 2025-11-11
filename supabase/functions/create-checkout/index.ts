// supabase/functions/create-checkout/index.ts
// deno-lint-ignore-file no-explicit-any
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

Deno.serve(async (req) => {
  // 1) CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // 2) Autoriser seulement POST
  if (req.method !== "POST") {
    return new Response("Not found", { status: 404, headers: CORS_HEADERS });
  }

  try {
    const { total_cents, email } = await req.json();

    if (!Number.isFinite(total_cents) || total_cents <= 0) {
      return new Response(
        JSON.stringify({ error: "total_cents invalide" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // ❗️Ces 3 secrets doivent être définis dans Supabase > Edge Functions > Secrets
    const API_KEY    = Deno.env.get("LEMON_API_KEY")!;
    const STORE_ID   = Deno.env.get("LEMON_STORE_ID")!;
    const VARIANT_ID = Deno.env.get("LEMON_VARIANT_ID")!;

    const body = {
  data: {
    type: "checkouts",
    attributes: {
      custom_price: total_cents,      // en cents
      test_mode: true,                // garde true tant que ton app est en review
      checkout_data: { email: email || "" },
    },
    relationships: {
      store:   { data: { type: "stores",   id: String(STORE_ID) } },   // ⬅️ OBLIGATOIRE
      variant: { data: { type: "variants", id: String(VARIANT_ID) } }, // ⬅️ OBLIGATOIRE
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
      body: JSON.stringify(body),
    });

    // ----- Gestion d'erreur verbeuse (debug) -----
    if (!res.ok) {
      const lemonText = await res.text();
      let lemonJson: any = null;
      try { lemonJson = JSON.parse(lemonText); } catch {}
      console.error("LEMON FAIL", res.status, res.statusText, lemonJson || lemonText);

      return new Response(
        JSON.stringify({
          error: "lemon_failed",
          status: res.status,
          statusText: res.statusText,
          details: lemonJson || lemonText,
        }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    // ---------------------------------------------

    const json: any = await res.json();
    const url = json?.data?.attributes?.url;

    return new Response(JSON.stringify({ url }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("SERVER ERROR", e);
    return new Response(
      JSON.stringify({ error: "server_error", details: String(e) }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});

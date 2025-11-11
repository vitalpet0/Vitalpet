// api/sellsy-sync.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Méthode non autorisée" });
  }

  // === ENV ===
  const CLIENT_ID = process.env.SELLSY_CLIENT_ID;
  const CLIENT_SECRET = process.env.SELLSY_CLIENT_SECRET;
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(500).json({ ok: false, error: "Clés Sellsy manquantes" });
  }

  // --- util: body JSON sûr ---
  async function readJsonBody() {
    if (req.body && typeof req.body === "object") return req.body;
    const chunks = [];
    for await (const c of req) chunks.push(c);
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      return {};
    }
  }

  // === 1) TOKEN Sellsy ===
  const TOKEN_URL = "https://login.sellsy.com/oauth2/access-tokens";
  let accessToken = "";
  try {
    const tokResp = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    const tokJson = await tokResp.json();
    if (!tokResp.ok || !tokJson?.access_token) {
      throw new Error(`TOKEN ${tokResp.status}: ${JSON.stringify(tokJson)}`);
    }
    accessToken = tokJson.access_token;
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Auth Sellsy: ${err.message}` });
  }

  // === 2) Body venant du front OU d’un webhook interne ===
  const body = await readJsonBody();
  const {
    form: rawForm = {},
    cart: rawCart = [],
    currency = "EUR",
    shipping = null,
  } = body || {};

  // === 3) Helpers Sellsy v2 ===
  const API_BASE = "https://api.sellsy.com/v2";

  async function sfetch(url, options) {
    const resp = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options && options.headers),
      },
    });
    const text = await resp.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    if (!resp.ok) {
      const method = (options?.method || "GET").toUpperCase();
      console.error(`❌ ${method} ${url} -> ${resp.status} ${text.slice(0, 400)}`);
      throw new Error(`${resp.status}: ${text}`);
    }
    return json ?? {};
  }

  // --- Individuals
  async function findIndividual(email) {
    try {
      const j = await sfetch(`${API_BASE}/individuals/search`, {
        method: "POST",
        body: JSON.stringify({ filters: { email: [email] }, limit: 5 }),
      });
      const items = Array.isArray(j?.data) ? j.data : [];
      return items.find((it) => it?.email?.toLowerCase?.() === email) || null;
    } catch {
      return null;
    }
  }

  async function createIndividual(f) {
    return await sfetch(`${API_BASE}/individuals`, {
      method: "POST",
      body: JSON.stringify({
        type: "client",
        first_name: f.prenom || "",
        last_name: f.nom || (f.email?.split("@")[0] ?? "Client"),
        email: f.email || "",
        phone_number: f.telephone || null,
        mobile_number: f.telephone || null,
      }),
    });
  }

  async function updateIndividual(id, f) {
    return await sfetch(`${API_BASE}/individuals/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        type: "client",
        first_name: f.prenom || "",
        last_name: f.nom || (f.email?.split("@")[0] ?? "Client"),
        email: f.email || "",
        phone_number: f.telephone || null,
        mobile_number: f.telephone || null,
      }),
    });
  }

  // Adresse principale (best-effort)
  async function createAddress(individualId, f, countryCode) {
    return await sfetch(`${API_BASE}/individuals/${individualId}/addresses`, {
      method: "POST",
      body: JSON.stringify({
        name: "Adresse principale",
        address_line_1: f.adresse || "",
        address_line_2: f.complement || "",
        postal_code: f.codePostal || "",
        city: f.ville || "",
        country_code: countryCode,
      }),
    });
  }

  // --- Taxes cache
  const taxCache = { list: null };
  async function getTaxIdByRate(ratePct) {
    try {
      if (!taxCache.list) {
        const resp = await sfetch(`${API_BASE}/taxes`, { method: "GET" });
        taxCache.list = Array.isArray(resp?.data) ? resp.data : [];
      }
      const wanted = Number(ratePct || 0);
      const found = taxCache.list.find((t) => Number(t?.rate) === wanted);
      return found?.id || null;
    } catch {
      return null;
    }
  }

  const toMoney = (n) => (Number(n || 0)).toFixed(2);

  // --- Devis
  async function createEstimate({ individualId, form, cart, shipping, currency, countryCode }) {
    if (!Array.isArray(cart) || cart.length === 0) return null;

    const rows = [];
    for (const item of cart) {
      // garde-fous : valeurs propres
      const qty = Math.max(1, Number(item.qty || 1));
      const unit = Number.isFinite(Number(item.unitPrice)) ? Number(item.unitPrice) : 0;

      const tax_id = await getTaxIdByRate(item.taxRate);
      rows.push({
        type: "single",
        description: item.name,
        reference: item.sku || undefined,
        unit_amount: toMoney(unit),
        quantity: String(qty),
        ...(tax_id ? { tax_id } : {}),
      });
    }

    if (shipping && Number(shipping.amount) > 0) {
      const tax_id = await getTaxIdByRate(shipping.taxRate || 0);
      rows.push({
        type: "single",
        description: shipping.label || "Livraison standard",
        unit_amount: toMoney(shipping.amount),
        quantity: "1",
        ...(tax_id ? { tax_id } : {}),
      });
    }

    const payload = {
      subject: `Commande ${form.prenom} ${form.nom}`.trim(),
      currency: currency || "EUR",
      related: [{ id: Number(individualId), type: "individual" }],
      rows,
      invoicing_address: {
        name: `${form.prenom} ${form.nom}`.trim(),
        address_line_1: form.adresse || "",
        address_line_2: form.complement || "",
        postal_code: form.codePostal || "",
        city: form.ville || "",
        country_code: countryCode,
      },
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("📦 Payload envoyé à Sellsy:", JSON.stringify(payload, null, 2));
    }

    const created = await sfetch(`${API_BASE}/estimates`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return created;
  }

  // ====== 💡 Mode WEBHOOK (ne touche pas au flux existant) ======
  // { kind: "create_contact", payload: { email, first_name, last_name, phone } }
  if (body?.kind === "create_contact") {
    try {
      const p = body.payload || {};
      const email = String(p.email || "").trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ ok: false, error: "Email requis (webhook)" });
      }
      const f = {
        prenom: String(p.first_name || "").trim(),
        nom: String(p.last_name || "").trim(),
        email,
        telephone: String(p.phone || "").trim(),
      };

      let indiv = await findIndividual(email);
      let individualId, status;
      if (indiv?.id) {
        await updateIndividual(indiv.id, f);
        individualId = indiv.id;
        status = "Client mis à jour (webhook)";
      } else {
        const created = await createIndividual(f);
        individualId = created?.data?.id || created?.id;
        status = "Client créé (webhook)";
      }

      return res.status(200).json({
        ok: true,
        mode: "webhook",
        message: status,
        individualId,
      });
    } catch (e) {
      console.error("Webhook create_contact error:", e.message);
      return res.status(400).json({ ok: false, error: e.message, mode: "webhook" });
    }
  }
  // ====== fin du mode webhook ======

  // === 2-bis) Normalisation form (flux FRONT existant)
  const form = {
    prenom: (rawForm.prenom || "").trim(),
    nom: (rawForm.nom || "").trim(),
    email: (rawForm.email || "").trim().toLowerCase(),
    telephone: (rawForm.telephone || rawForm.phone || "").trim(),
    adresse: (rawForm.adresse || rawForm.address || "").trim(),
    complement: (rawForm.complement || rawForm.address_line_2 || "").trim(),
    ville: (rawForm.ville || rawForm.city || "").trim(),
    codePostal: (rawForm.codePostal || rawForm.postalCode || rawForm.zipcode || "").trim(),
  };

  const countryCode = "FR"; // centralisé

  if (!form.email) {
    return res.status(400).json({ ok: false, error: "Email requis pour le client" });
  }

  // Panier normalisé (HT)
  const cart = Array.isArray(rawCart)
    ? rawCart.map((it) => ({
        sku: String(it?.sku ?? it?.id ?? "").trim(),
        name: String(it?.name ?? it?.label ?? "Article").trim(),
        qty: Number(it?.qty ?? it?.quantity ?? 1) || 1,
        unitPrice: Number(it?.unitPrice ?? it?.price_ht ?? it?.price ?? 0) || 0,
        taxRate: Number(it?.taxRate ?? it?.vat ?? 0) || 0,
      }))
    : [];

  // === 4) Flux FRONT inchangé ===
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("↪️ Payload reçu (safe):", {
        email: form.email,
        hasPhone: !!form.telephone,
        cartLen: cart.length,
        currency,
        shipping: shipping ? { ...shipping, amount: Number(shipping.amount) } : null,
      });
    }

    // 1) Individual
    let indiv = await findIndividual(form.email);
    let individualId, status;
    if (indiv?.id) {
      individualId = indiv.id;
      await updateIndividual(individualId, form);
      status = "Client mis à jour";
    } else {
      const created = await createIndividual(form);
      individualId = created?.data?.id || created?.id;
      status = "Client créé";
      if (form.adresse || form.ville || form.codePostal) {
        try {
          await createAddress(individualId, form, countryCode);
        } catch (e) {
          console.warn("Adresse non créée:", e.message);
        }
      }
    }

    // 2) Devis
    const estimate = await createEstimate({
      individualId,
      form,
      cart,
      shipping,
      currency,
      countryCode,
    });
    const estimateId = estimate?.data?.id || estimate?.id || null;

    // 3) Conversion automatique du devis en facture (best-effort)
    let invoiceId = null;
    if (estimateId) {
      try {
        const invoice = await sfetch(`${API_BASE}/estimates/${estimateId}/convert-to-invoice`, {
          method: "POST",
          body: JSON.stringify({
            status: "sent",   // "draft" si tu préfères brouillon
            send_email: false,
          }),
        });
        invoiceId = invoice?.data?.id || invoice?.id || null;
        console.log("🧾 Facture créée automatiquement :", invoiceId);
      } catch (err) {
        console.warn("⚠️ Erreur lors de la conversion du devis :", err.message);
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("🧾 Devis créé :", estimateId);
    }

    return res.status(200).json({
      ok: true,
      message: status,
      individualId,
      estimateId,
      invoiceId,
    });
  } catch (e) {
    console.error("Erreur finale 400:", e.message);
    return res.status(400).json({ ok: false, error: e.message });
  }
}

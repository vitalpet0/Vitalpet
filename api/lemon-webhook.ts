// api/lemon-webhook.ts
export default async function handler(req: any, res: any) {
  // 1) Lemon envoie en POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // 2) Lecture body JSON sûre
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

    // 3) On lit le type d’évènement depuis l’entête Lemon
    //    (Lemon envoie "X-Event-Name": ex. "subscription_payment_success")
    const eventName = String(req.headers["x-event-name"] || "").trim();

    // 4) On ne TRAITE que le paiement réussi, on skippe le reste pour éviter les doublons.
    if (eventName !== "subscription_payment_success") {
      if (process.env.NODE_ENV !== "production") {
        console.log("lemon-webhook: skipped event:", eventName || "<none>");
      }
      return res.status(200).json({ ok: true, forwarded: false, reason: "skipped_event" });
    }

    // 5) Champs utiles
    const data = payload?.data || {};
    const attributes = data?.attributes || {};

    const email =
      attributes?.user_email ||
      attributes?.email ||
      attributes?.customer_email ||
      attributes?.user?.email ||
      attributes?.customer?.email ||
      "";

    const firstName =
      attributes?.user_name ||
      attributes?.first_name ||
      "";

    const lastName = attributes?.last_name || "";
    const phone = attributes?.user_phone || "";

    const safeEmail = String(email || "").trim().toLowerCase();
    if (!safeEmail) {
      // On ack, mais on ne forward pas si pas d’email (sinon retry infini côté Lemon)
      return res.status(200).json({ ok: true, forwarded: false, reason: "no_email" });
    }

    // 6) Forward interne -> crée/MAJ le contact uniquement (pas de devis ici)
    const baseUrl =
      process.env.SELF_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://vitalpetfrance.com");

    const fwd = await fetch(`${baseUrl}/api/sellsy-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "create_contact",
        payload: {
          email: safeEmail,
          first_name: firstName,
          last_name: lastName,
          phone,
        },
      }),
    });

    const out = await fwd.text();
    if (process.env.NODE_ENV !== "production") {
      console.log("sellsy-sync <- webhook:", fwd.status, out.slice(0, 300));
    }

    // Toujours 200 pour stopper les retries de Lemon
    return res.status(200).json({ ok: true, forwarded: true });
  } catch (e: any) {
    console.error("lemon-webhook error:", e?.message || e);
    return res.status(200).json({ ok: true, forwarded: false, error: "handled" });
  }
}

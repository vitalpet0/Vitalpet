// api/lemon-webhook.ts
export default async function handler(req: any, res: any) {
  // Lemon envoie en POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // ⚠️ IMPORTANT : on ne vérifie plus de header custom (Lemon ne peut pas en envoyer).
  // (Si tu veux plus tard, implémente la vérif via X-Signature + signing secret Lemon.)

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

    const data = payload?.data || {};
    const attributes = data?.attributes || {};

    // Email (différents emplacements possibles suivant l’event)
    const email =
      attributes?.user_email ||
      attributes?.email ||
      attributes?.customer_email ||
      attributes?.user?.email ||
      attributes?.customer?.email ||
      "";

    const safeEmail = String(email || "").trim().toLowerCase();

    if (process.env.NODE_ENV !== "production") {
      console.log("lemon-webhook in:", {
        type: data?.type,
        id: data?.id,
        email: safeEmail,
      });
    }

    // Pas d’email -> on ACK quand même pour éviter les retries
    if (!safeEmail) {
      return res.status(200).json({ ok: true, forwarded: false, reason: "no email" });
    }

    // URL interne vers notre API (toujours le même host que la requête reçue)
    const host =
      (req.headers["x-forwarded-host"] as string) ||
      (req.headers.host as string) ||
      "vitalpetfrance.com";
    const baseUrl = `https://${host}`;

    // On forward vers /api/sellsy-sync (création/màj contact uniquement)
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

    if (process.env.NODE_ENV !== "production") {
      const fwdTxt = await fwd.text();
      console.log("sellsy-sync <- webhook:", fwd.status, fwdTxt.slice(0, 300));
    }

    // Toujours 200 pour éviter les croix rouges côté Lemon
    return res.status(200).json({ ok: true, forwarded: true });
  } catch (e: any) {
    console.error("lemon-webhook error:", e?.message || e);
    return res.status(200).json({ ok: true, forwarded: false, error: "handled" });
  }
}

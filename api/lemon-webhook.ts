// api/lemon-webhook.ts
export default async function handler(req: any, res: any) {
  // Lemon envoie en POST
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  // ----- Body JSON sûr (compatible Vercel) -----
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
    const data = payload?.data ?? {};
    const attributes = data?.attributes ?? {};

    // Email côté order / subscription (on balaie plusieurs champs possibles)
    const emailCandidate =
      attributes?.user_email ||
      attributes?.email ||
      attributes?.customer_email ||
      attributes?.user?.email ||
      attributes?.customer?.email ||
      "";

    const safeEmail = String(emailCandidate || "").trim().toLowerCase();

    if (process.env.NODE_ENV !== "production") {
      console.log("lemon-webhook in:", {
        type: data?.type,
        id: data?.id,
        email: safeEmail || "<none>",
      });
    }

    // S’il n’y a pas d’email, on ACK pour éviter les retries infinis
    if (!safeEmail) {
      return res.status(200).json({ ok: true, forwarded: false, reason: "no email in webhook" });
    }

    // URL de base pour appeler notre API (ordre: SELF_BASE_URL > VERCEL_URL > localhost)
    const baseUrl =
      (process.env.SELF_BASE_URL && String(process.env.SELF_BASE_URL).replace(/\/$/, "")) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";

    // Forward minimal vers sellsy-sync (création/MAJ contact **uniquement**)
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

    const fwdText = await fwd.text();
    if (process.env.NODE_ENV !== "production") {
      console.log("sellsy-sync <- webhook:", fwd.status, fwdText.slice(0, 400));
    }

    // On répond 200 dans tous les cas pour que Lemon arrête les croix rouges
    return res.status(200).json({ ok: true, forwarded: fwd.ok });
  } catch (e: any) {
    console.error("lemon-webhook error:", e?.message || e);
    // Toujours 200 (évite les retries agressifs)
    return res.status(200).json({ ok: true, forwarded: false, error: "handled" });
  }
}

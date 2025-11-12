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
    const data = payload?.data || {};
    const attributes = data?.attributes || {};
    // On ratisse large pour trouver un email
    let safeEmail =
      String(
        attributes?.user_email ||
          attributes?.email ||
          attributes?.customer_email ||
          attributes?.user?.email ||
          attributes?.customer?.email ||
          ""
      )
        .trim()
        .toLowerCase();

    // (Optionnel) si un jour tu veux vérifier la signature officielle Lemon :
    // const signature = req.headers["x-signature"] as string | undefined;
    // const secret = process.env.LEMON_SIGNING_SECRET || "";
    // -> si secret, vérifier HMAC(signature, rawBody) etc. (pas nécessaire pour avancer)

    if (process.env.NODE_ENV !== "production") {
      console.log("lemon-webhook in:", {
        type: data?.type,
        id: data?.id,
        email: safeEmail || "(none)",
      });
    }

    // 3) S'il n'y a pas d'email, on ACK pour éviter les retries, mais on ne forward pas
    if (!safeEmail) {
      return res.status(200).json({ ok: true, forwarded: false, reason: "no email" });
    }

    // 4) Forward interne → Sellsy (création/màj contact seulement)
    const baseUrl =
      process.env.SELF_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
      console.log("sellsy-sync <- webhook:", fwd.status, fwdTxt.slice(0, 400));
    }

    // 5) Toujours 200 pour que Lemon arrête de marquer en rouge
    return res.status(200).json({ ok: true, forwarded: true });
  } catch (e: any) {
    console.error("lemon-webhook error:", e?.message || e);
    return res.status(200).json({ ok: true, forwarded: false, error: "handled" });
  }
}

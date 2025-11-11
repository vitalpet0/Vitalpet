// src/pages/Checkout.jsx
import { useState, useRef, useEffect } from "react";

export default function Checkout() {
  // --- 1) State du formulaire
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    complement: "",
    ville: "",
    codePostal: "",
    pays: "FR",
    terms: false,
  });

  // --- 2) Panier / shipping / currency
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState({ label: "Livraison standard (HT)", amount: 4.9, taxRate: 20 });
  const [currency, setCurrency] = useState("EUR");

  // --- 3) UI
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const topRef = useRef(null);

  // --- 4) Lecture localStorage
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem("cart");
      if (rawCart) {
        const parsed = JSON.parse(rawCart);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {}

    try {
      const rawShip = localStorage.getItem("checkoutShipping");
      if (rawShip) {
        const parsed = JSON.parse(rawShip);
        if (parsed && typeof parsed === "object") {
          setShipping({
            label: String(parsed.label || "Livraison standard (HT)"),
            amount: Number(parsed.amount) || 0,
            taxRate: Number(parsed.taxRate) || 0,
          });
        }
      }
    } catch {}

    try {
      const cur = localStorage.getItem("currency");
      if (cur) setCurrency(cur);
    } catch {}
  }, []);

  // --- 5) Outils de calcul / normalisation
  const toNumber = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);

  const cartToPayload = (items) =>
    (items || []).map((it) => ({
      sku: String(it?.sku ?? it?.id ?? "").trim(),
      name: String(it?.name ?? it?.title ?? "Article").trim(),
      qty: toNumber(it?.qty ?? it?.quantity ?? 1) || 1,
      unitPrice: toNumber(it?.unitPrice ?? it?.priceHT ?? it?.price ?? 0) || 0, // HT
      taxRate: toNumber(it?.taxRate ?? it?.vat ?? 0) || 0, // %
    }));

  const cartPayload = cartToPayload(cart);

  const totalHT = cartPayload.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
  const totalTVA = cartPayload.reduce((sum, it) => sum + (it.unitPrice * it.qty * it.taxRate) / 100, 0);
  const shippingTVA = (toNumber(shipping.amount) * toNumber(shipping.taxRate)) / 100;
  const grandTotalTTC = totalHT + totalTVA + toNumber(shipping.amount) + shippingTVA;

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const normalize = (f) => ({
    ...f,
    email: f.email.trim().toLowerCase(),
    prenom: f.prenom.trim(),
    nom: f.nom.trim(),
    telephone: f.telephone.trim(),
    adresse: f.adresse.trim(),
    complement: f.complement.trim(),
    ville: f.ville.trim(),
    codePostal: f.codePostal.trim(),
  });

  function validate(f) {
    if (!f.prenom || !f.nom || !f.email || !f.adresse || !f.ville || !f.codePostal) return "Merci de remplir tous les champs obligatoires.";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return "Adresse email invalide.";
    if (f.codePostal.length < 3) return "Code postal invalide.";
    if (!f.terms) return "Merci d’accepter les conditions.";
    if (!cartPayload.length) return "Votre panier est vide.";
    return "";
  }

  // --- 7) Submit -> Vercel API -> Lemon Squeezy
  async function onSubmit(e) {
    e.preventDefault();
    if (sending) return;

    const f = normalize(form);
    const msg = validate(f);
    if (msg) {
      setError(msg);
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }

    setError("");
    setSending(true);

    try {
      const totalCents = Math.round(grandTotalTTC * 100);

      // Appel SAME-ORIGIN vers l’API Vercel (api/create-checkout)
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_cents: totalCents,
          email: f.email,
        }),
      });

      const text = await res.text();
      console.log("[checkout function raw]", text);
      let data = null;
      try { data = JSON.parse(text); } catch {}

      if (!res.ok || !data?.url) {
        const detail = (data && (data.details || data.error || data.message)) || text || `HTTP ${res.status}`;
        throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
      }

      // Redirection vers le checkout Lemon
      window.location.href = data.url;

      // Nettoyage local optionnel
      try {
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutShipping");
      } catch {}
    } catch (err) {
      console.error("Checkout submit error:", err);
      setError(import.meta.env.DEV ? String(err.message || err) : "Désolé, une erreur est survenue pendant l’envoi. Réessayez.");
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } finally {
      setSending(false);
    }
  }

  // --- 8) UI
  return (
    <div className="max-w-3xl mx-auto p-6" style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }} ref={topRef}>
      <h1 className="text-2xl font-semibold mb-4">Informations de livraison</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <div className="mb-6 border rounded p-3 bg-gray-50">
        <h2 className="font-medium mb-2">Votre panier</h2>
        {cartPayload.length === 0 ? (
          <p className="text-sm text-gray-600">Panier vide.</p>
        ) : (
          <>
            <ul className="space-y-1 text-sm">
              {cartPayload.map((it, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>
                    {it.name} × {it.qty}
                    {it.sku ? <span className="text-gray-500"> — {it.sku}</span> : null}
                  </span>
                  <span>{(it.unitPrice * it.qty).toFixed(2)} {currency} HT</span>
                </li>
              ))}
            </ul>
            <hr className="my-2" />
            <div className="flex justify-between text-sm"><span>Sous-total HT</span><span>{totalHT.toFixed(2)} {currency}</span></div>
            <div className="flex justify-between text-sm"><span>TVA articles</span><span>{totalTVA.toFixed(2)} {currency}</span></div>
            <div className="flex justify-between text-sm"><span>{shipping.label}</span><span>{toNumber(shipping.amount).toFixed(2)} {currency}</span></div>
            <div className="flex justify-between text-sm"><span>TVA livraison</span><span>{shippingTVA.toFixed(2)} {currency}</span></div>
            <div className="flex justify-between font-semibold mt-1"><span>Total TTC</span><span>{grandTotalTTC.toFixed(2)} {currency}</span></div>
          </>
        )}
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Prénom *</label>
          <input name="prenom" value={form.prenom} onChange={onChange} className="w-full border rounded p-2" required autoComplete="given-name" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nom *</label>
          <input name="nom" value={form.nom} onChange={onChange} className="w-full border rounded p-2" required autoComplete="family-name" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email *</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded p-2" required autoComplete="email" inputMode="email" />
        </div>
        <div>
          <label className="block text-sm mb-1">Téléphone</label>
          <input type="tel" name="telephone" value={form.telephone} onChange={onChange} className="w-full border rounded p-2" autoComplete="tel" inputMode="tel" placeholder="+33 6 12 34 56 78" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Adresse *</label>
          <input name="adresse" value={form.adresse} onChange={onChange} className="w-full border rounded p-2" required autoComplete="address-line1" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Complément d’adresse</label>
          <input name="complement" value={form.complement} onChange={onChange} className="w-full border rounded p-2" autoComplete="address-line2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Ville *</label>
          <input name="ville" value={form.ville} onChange={onChange} className="w-full border rounded p-2" required autoComplete="address-level2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Code postal *</label>
          <input name="codePostal" value={form.codePostal} onChange={onChange} className="w-full border rounded p-2" required inputMode="numeric" autoComplete="postal-code" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Pays</label>
          <select name="pays" value={form.pays} onChange={onChange} className="w-full border rounded p-2" autoComplete="country">
            {[
              { code: "FR", label: "France" },
              { code: "BE", label: "Belgique" },
              { code: "CH", label: "Suisse" },
              { code: "LU", label: "Luxembourg" },
              { code: "MC", label: "Monaco" },
            ].map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <input id="terms" type="checkbox" name="terms" checked={form.terms} onChange={onChange} />
          <label htmlFor="terms" className="text-sm">J’accepte les conditions générales *</label>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={sending} className="w-full md:w-auto px-6 py-3 rounded bg-black text-white hover:opacity-90 disabled:opacity-50" style={{ marginBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
            {sending ? "Envoi..." : "Valider et payer"}
          </button>
        </div>
      </form>
    </div>
  );
}

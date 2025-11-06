import { useState } from "react";

export default function Checkout() {
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
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const countries = [
    { code: "FR", label: "France" },
    { code: "BE", label: "Belgique" },
    { code: "CH", label: "Suisse" },
    { code: "LU", label: "Luxembourg" },
    { code: "MC", label: "Monaco" }
  ];

  function onChange(e) {
    const { name, type, value, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    // validations simples
    if (!form.prenom || !form.nom || !form.email || !form.adresse || !form.ville || !form.codePostal) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    if (!form.terms) {
      setError("Merci d’accepter les conditions.");
      return;
    }

    setSending(true);
    try {
      // OPTION 1 — dummy: juste simuler la réussite
      // await new Promise(r => setTimeout(r, 700));

      // OPTION 2 — envoyer vers une fonction serverless (décommente si tu crées /api/create-order.js)
      // const res = await fetch("/api/create-order", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // });
      // if (!res.ok) throw new Error("Erreur réseau");
      // const data = await res.json();
      // console.log("Order created:", data);

      setDone(true);
    } catch (err) {
      setError("Désolé, une erreur est survenue. Réessaie.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-2">Merci !</h1>
        <p className="mb-4">Nous avons bien reçu vos informations.</p>
        <p className="text-sm text-gray-600">
          (Ici tu peux rediriger vers un paiement Stripe, afficher un récapitulatif, etc.)
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Informations de livraison</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">{error}</div>}

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Prénom *</label>
          <input name="prenom" value={form.prenom} onChange={onChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Nom *</label>
          <input name="nom" value={form.nom} onChange={onChange} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Email *</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Téléphone</label>
          <input name="telephone" value={form.telephone} onChange={onChange} className="w-full border rounded p-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Adresse *</label>
          <input name="adresse" value={form.adresse} onChange={onChange} className="w-full border rounded p-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Complément d’adresse</label>
          <input name="complement" value={form.complement} onChange={onChange} className="w-full border rounded p-2" />
        </div>

        <div>
          <label className="block text-sm mb-1">Ville *</label>
          <input name="ville" value={form.ville} onChange={onChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Code postal *</label>
          <input name="codePostal" value={form.codePostal} onChange={onChange} className="w-full border rounded p-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Pays</label>
          <select name="pays" value={form.pays} onChange={onChange} className="w-full border rounded p-2">
            {countries.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <input id="terms" type="checkbox" name="terms" checked={form.terms} onChange={onChange} />
          <label htmlFor="terms" className="text-sm">J’accepte les conditions générales *</label>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={sending}
            className="w-full md:w-auto px-6 py-3 rounded bg-black text-white hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Envoi..." : "Valider la livraison"}
          </button>
        </div>
      </form>
    </div>
  );
}

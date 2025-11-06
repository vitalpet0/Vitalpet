// src/pages/Livraison.jsx
export default function Livraison() {
  return (
    <div className="container mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Informations de livraison</h1>

      <section className="space-y-6 text-lg">
        <div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">🚚 Délais</h2>
          <p>
            Préparation en <strong>24–48h ouvrées</strong>, livraison{" "}
            <strong>2–5 jours</strong>.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">📦 Frais</h2>
          <ul className="list-disc ml-6">
            <li>Standard : <strong>4,90 €</strong></li>
            <li>Offerte dès <strong>49 €</strong> d’achat</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">🌍 Zone</h2>
          <p>France métropolitaine. Pour DOM-TOM / international, nous contacter.</p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-green-700 mb-2">📞 Suivi</h2>
          <p>
            Mail avec lien de suivi après expédition —{" "}
            <a className="underline text-green-700" href="commercial@vitalpetfrance.com">
              commercial@vitalpetfrance.com
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
}

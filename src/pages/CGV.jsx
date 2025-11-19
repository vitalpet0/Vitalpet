// src/pages/CGV.jsx
import React from "react";

export default function CGV() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Conditions Générales de Vente — VitalPet</h1>
      <p className="text-sm text-neutral-600 mb-6">Date de mise à jour : 10/11/2025</p>

      <article className="prose prose-neutral">
        <h2>1. Parties contractantes — informations légales</h2>
        <p>Les présentes Conditions Générales de Vente (CGV) s’appliquent aux ventes conclues sur le site <strong>VitalPetfrance.com</strong>...</p>

        <h2>2. Définitions</h2>
        <p>Produit(s) : biens vendus sur le Site...</p>

        <h2>3. Champ d’application</h2>
        <p>Les présentes CGV régissent toute commande passée sur VitalPetfrance.com...</p>

        {/* --- tu peux coller ici la version complète des CGV que je t'ai fournie précédemment --- */}

        <h2>10. Droit de rétractation</h2>
        <p>Le consommateur dispose d'un délai de 14 jours pour exercer son droit de rétractation...</p>

        <h2>Contact</h2>
        <p>
          Service client : <a href="Comercial@vitalpetfrance.com">contact@vitalpetfrance.com</a><br />
          Adresse : [à compléter]
        </p>
      </article>
    </main>
  );
}

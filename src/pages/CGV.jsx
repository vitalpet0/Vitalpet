// src/pages/CGV.jsx
import React from "react";

// Optionnel : utile si tu veux tracer la version acceptée côté checkout/API
export const CGV_VERSION = "1.0-2025-11-19";

export default function CGV() {
  const year = new Date().getFullYear();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Conditions Générales de Vente — VitalPet</h1>
      <p className="text-sm text-neutral-600 mb-6">
        Version : 1.0 — Mise à jour : 19/11/{year}
      </p>

      <article className="prose prose-neutral">
        <h2>1. Mentions légales & Parties</h2>
        <p>
          Le site <strong>VitalPetfrance.com</strong> (ci-après « le Site ») est édité par :
          <br />
          <strong>[Raison sociale / VitalPet France]</strong>, [forme juridique], capital : [€],
          SIRET : <strong>[SIRET]</strong>, RCS : <strong>[RCS + ville]</strong>, TVA intracommunautaire :
          <strong> [FRxx…]</strong>.
          <br />
          Siège social : <strong>[Adresse complète]</strong>. Hébergeur : <strong>[Nom de l’hébergeur]</strong> — [coordonnées].
          <br />
          Contact : <a href="mailto:contact@vitalpetfrance.com">contact@vitalpetfrance.com</a> — Tél. : [numéro].
        </p>

        <h2>2. Objet & Champ d’application</h2>
        <p>
          Les présentes Conditions Générales de Vente (« CGV ») régissent, sans restriction ni réserve, l’ensemble des
          ventes de produits et services (y compris l’abonnement « VitalPet Box ») conclues entre VitalPet (le « Vendeur »)
          et toute personne (le « Client ») via le Site. La validation d’une commande implique l’acceptation pleine et
          entière des CGV en vigueur au jour de la commande.
        </p>

        <h2>3. Définitions</h2>
        <ul>
          <li><strong>Produits</strong> : biens vendus sur le Site (alimentation, friandises, litière, hygiène, jouets, accessoires…).</li>
          <li><strong>Box / Abonnement</strong> : service d’envoi récurrent de Produits selon une fréquence choisie.</li>
          <li><strong>Commande</strong> : engagement d’achat du Client pour des Produits et/ou un Abonnement.</li>
          <li><strong>Compte</strong> : espace personnel du Client sur le Site.</li>
        </ul>

        <h2>4. Informations produits</h2>
        <p>
          Les caractéristiques essentielles sont présentées sur les fiches produits. Les photographies ont valeur
          illustrative ; en cas d’écart mineur n’altérant pas les caractéristiques essentielles, la description textuelle
          prévaut. Le Client demeure responsable du bon usage des Produits (allergies, intolérances, surveillance des jouets,
          respect des rations, avis vétérinaire si besoin).
        </p>

        <h2>5. Prix</h2>
        <p>
          Les prix sont indiqués en euros (EUR), <strong>TTC</strong>, hors frais de livraison éventuels, précisés avant
          validation. Le Vendeur peut modifier les prix à tout moment ; le prix applicable est celui affiché lors de la
          validation du panier. Les coupons/promotions ne sont pas cumulables sauf mention contraire.
        </p>

        <h2>6. Compte client</h2>
        <p>
          Certaines fonctionnalités (suivi, abonnement) nécessitent un Compte. Le Client s’engage à fournir des
          informations exactes et à les mettre à jour. Les identifiants sont personnels et confidentiels.
        </p>

        <h2>7. Commande & formation du contrat</h2>
        <ol>
          <li>Sélection des Produits / Box ;</li>
          <li>Récapitulatif & vérification ;</li>
          <li>
            Validation après <strong>acceptation des CGV</strong> et paiement ; le contrat est parfait à l’envoi de l’e‑mail de
            confirmation par le Vendeur.
          </li>
        </ol>
        <p>
          Le Vendeur se réserve le droit de refuser toute commande légitime (suspicion de fraude, litige antérieur,
          indisponibilité anormale…).
        </p>

        <h2>8. Abonnement « VitalPet Box »</h2>
        <ul>
          <li><strong>Sans engagement</strong> : renouvellement automatique à la fréquence choisie (mensuelle ou trimestrielle).</li>
          <li>
            <strong>Gestion</strong> : modification, pause ou résiliation depuis le Compte Client. Pour éviter la
            prochaine échéance, agir <strong>au moins 48h</strong> avant la date de renouvellement.
          </li>
          <li>
            <strong>Contenu</strong> : peut évoluer ; des équivalences ou substitutions de valeur comparable peuvent être proposées.
          </li>
          <li>
            <strong>Échec de débit / impayés</strong> : l’expédition peut être suspendue jusqu’à régularisation.
          </li>
        </ul>

        <h2>9. Paiement & Sécurisation</h2>
        <p>
          Le règlement s’effectue en ligne via un prestataire de paiement sécurisé (p. ex. Lemon Squeezy / Stripe).
          Le Vendeur n’a pas accès aux données bancaires. Toute commande est payable immédiatement ; en cas de refus
          d’autorisation, la commande est annulée de plein droit.
        </p>

        <h2>10. Disponibilité</h2>
        <p>
          Offres valables dans la limite des stocks. En cas d’indisponibilité post‑commande, le Vendeur proposera
          un remplacement équivalent, une nouvelle date d’expédition ou le remboursement.
        </p>

        <h2>11. Livraison</h2>
        <ul>
          <li><strong>Zones</strong> : France métropolitaine (par défaut). Belgique, Suisse, Luxembourg, Monaco : options et tarifs affichés lors du checkout.</li>
          <li><strong>Délais</strong> : indicatifs ; en moyenne 2–5 jours ouvrés après préparation (hors périodes exceptionnelles).</li>
          <li><strong>Réception</strong> : vérifier l’état du colis ; en cas d’avarie/manquant, formuler des réserves précises au transporteur et notifier le Vendeur sous 48h avec photos.</li>
          <li><strong>Colis non réclamé/adresse erronée</strong> : réexpédition possible avec refacturation des frais.</li>
        </ul>

        <h2>12. Droit de rétractation (14 jours) — Consommateur</h2>
        <p>
          Le Client consommateur dispose d’un délai de <strong>14 jours</strong> à compter de la <strong>réception</strong> pour se
          rétracter sans motif. Notification par email à{" "}
          <a href="mailto:contact@vitalpetfrance.com">contact@vitalpetfrance.com</a> ou via le formulaire type
          (Annexe). Les Produits doivent être renvoyés <strong>neufs, complets, non ouverts</strong>, dans leur
          emballage d’origine, à l’adresse communiquée par le Vendeur, <strong>aux frais du Client</strong> sauf erreur ou
          non‑conformité imputable au Vendeur.
        </p>
        <p>
          <strong>Exceptions (notamment)</strong> : Produits personnalisés ; denrées rapidement périssables ; Produits scellés
          ne pouvant être renvoyés pour des raisons d’hygiène/santé s’ils ont été descellés (ex. litière ouverte, aliments
          entamés) ; presse ; enregistrements/logiciels descellés.
        </p>
        <p>
          Remboursement sous <strong>14 jours</strong> à compter de la récupération des Produits (ou preuve d’expédition),
          incluant les frais de livraison standard initiaux ; les surcoûts (express, RDV…) ne sont pas remboursés.
        </p>

        <h2>13. Retours & échanges</h2>
        <p>
          Avant tout retour, contacter <a href="mailto:contact@vitalpetfrance.com">contact@vitalpetfrance.com</a> pour
          obtenir l’adresse et les instructions. Les Produits retournés ouverts, incomplets, endommagés ou impropres
          à la revente peuvent ne pas être remboursés ou faire l’objet d’une décote.
        </p>

        <h2>14. Garanties légales</h2>
        <ul>
          <li>
            <strong>Conformité (2 ans)</strong> : en cas de défaut de conformité, le Client peut obtenir la réparation ou le
            remplacement, ou, à défaut, la réduction du prix/la résolution.
          </li>
          <li>
            <strong>Vices cachés</strong> : permet la résolution de la vente ou une réduction du prix si le défaut,
            antérieur à la vente, rend le Produit impropre à l’usage.
          </li>
        </ul>
        <p>Contact service client pour la mise en œuvre : preuve d’achat + description du défaut.</p>

        <h2>15. Responsabilité & Sécurité d’usage</h2>
        <p>
          Les conseils fournis sur le Site (articles, fiches, e‑mails) sont informatifs et ne remplacent pas l’avis d’un
          vétérinaire. Le Vendeur n’est pas responsable d’un usage non conforme, d’une négligence ou d’un dommage indirect.
          <strong> Force majeure</strong> : suspension des obligations pendant la durée de l’événement (grèves, pannes,
          catastrophes…).
        </p>

        <h2>16. Réserve de propriété & transfert des risques</h2>
        <p>
          Le Vendeur conserve la <strong>propriété</strong> des Produits jusqu’au paiement intégral. Les <strong>risques</strong> sont
          transférés à la <strong>livraison</strong> au Client (ou à tout tiers désigné par lui).
        </p>

        <h2>17. Données personnelles (RGPD) & Cookies</h2>
        <p>
          Traitements nécessaires à la gestion des Commandes/Abonnements, à la relation client (facturation, livraison,
          SAV, prévention de la fraude) et à la prospection (avec consentement). Droits RGPD : accès, rectification,
          effacement, opposition, limitation, portabilité. Exercice des droits :{" "}
          <a href="mailto:contact@vitalpetfrance.com">contact@vitalpetfrance.com</a>. Voir la Politique de
          confidentialité/Cookies pour le détail (finalités, durées de conservation).
        </p>

        <h2>18. Médiation de la consommation</h2>
        <p>
          Après démarche préalable écrite auprès du service client et à défaut de solution amiable, le Client consommateur
          peut saisir gratuitement : <strong>[Nom du médiateur]</strong> — <em>[coordonnées / site du médiateur]</em>.
          Plateforme européenne de règlement en ligne des litiges :{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>.
        </p>

        <h2>19. Lutte anti‑fraude — Sécurité</h2>
        <p>
          Le Vendeur peut procéder à des vérifications (anti‑fraude/anti‑abus) et annuler une Commande en cas
          d’anomalie manifeste ou de non‑paiement. Les paiements sont traités par un prestataire certifié.
        </p>

        <h2>20. Preuve — Archivage</h2>
        <p>
          Les enregistrements électroniques (emails de confirmation, journaux techniques) conservés par le Vendeur et ses
          prestataires font foi. Les contrats sont archivés sur un support fiable et durable.
        </p>

        <h2>21. Propriété intellectuelle</h2>
        <p>
          Tous éléments du Site (textes, images, logos, marques, graphismes) sont protégés par les droits de propriété
          intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.
        </p>

        <h2>22. Modifications des CGV</h2>
        <p>
          Le Vendeur peut adapter les CGV ; la version applicable est celle en vigueur à la date de la commande.
          Pour les Abonnements, toute modification substantielle (prix/périodicité/contenu) fera l’objet d’une information
          préalable avec faculté de résiliation avant l’échéance suivante.
        </p>

        <h2>23. Droit applicable & juridiction</h2>
        <p>
          Les CGV sont soumises au droit français. Pour les consommateurs, les règles légales de compétence s’appliquent ;
          à défaut, compétence des tribunaux de <strong>[Ville du siège]</strong>.
        </p>

        <h2>24. Contact & adresse de retour</h2>
        <p>
          Service client : <a href="mailto:contact@vitalpetfrance.com">contact@vitalpetfrance.com</a>
          <br />
          Adresse de retour (après accord préalable) : <strong>[Adresse de retour]</strong>
        </p>

        <h3>Annexe — Formulaire type de rétractation</h3>
        <details>
          <summary>Afficher le modèle</summary>
          <pre>
{`À l’attention de « VitalPet France » — [Adresse de retour]
Je vous notifie par la présente ma rétractation du contrat portant sur la vente du(des) produit(s) ci-dessous :
— Commande n° : [___] — Reçue le : [___]
— Nom du consommateur : [___]
— Adresse du consommateur : [___]
— Date : [___]
— Signature (en cas de courrier papier) : [___]`}
          </pre>
        </details>
      </article>

      <p className="text-xs text-neutral-500 mt-8">
        © {year} VitalPet France — Document fourni à titre informatif. Faites valider vos mentions légales, zones de
        livraison, médiateur et adresses par votre conseil juridique.
      </p>
    </main>
  );
}

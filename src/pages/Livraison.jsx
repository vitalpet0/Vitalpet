// src/pages/Livraison.jsx
import React, { useEffect, useRef, useState } from "react";

/* ---- Petit wrapper d'animation au scroll ---- */
function Reveal({ as: Tag = "div", delay = 0, children, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pas d'anim si l’utilisateur préfère réduire les mouvements
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            // petit délai optionnel pour échelonner les blocs
            setTimeout(() => setVisible(true), delay);
            io.unobserve(el);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag
      ref={ref}
      className={
        className +
        " transition-all duration-700 ease-out will-change-transform" +
        (visible ? " opacity-100 translate-y-0" : " opacity-0 translate-y-4")
      }
    >
      {children}
    </Tag>
  );
}

export default function Livraison() {
  return (
    <div className="safe-page min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-800">
      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* En-tête */}
        <Reveal as="header" className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold text-neutral-900">
            Livraison VitalPet
          </h1>
          <p className="mt-3 text-neutral-600">
            Rapide, suivie et fiable — partout en France métropolitaine.
          </p>
        </Reveal>

        {/* Carte détail */}
        <div className="rounded-2xl border bg-white shadow-sm p-6">
          <Reveal className="space-y-2">
            <h2 className="text-lg font-medium text-emerald-700">Délais</h2>
            <p className="text-neutral-700">
              Préparation sous <strong>24 à 48h ouvrées</strong>, puis livraison en{" "}
              <strong>2 à 5 jours</strong> selon la destination.
            </p>
          </Reveal>

          <Reveal className="border-t pt-6 mt-6" delay={80}>
            <h2 className="text-lg font-medium text-emerald-700">Frais de livraison</h2>
            <p className="text-neutral-700">
              <strong>4,90 €</strong> — offerte dès <strong>49 €</strong> d’achat.
            </p>
          </Reveal>

          <Reveal className="border-t pt-6 mt-6" delay={120}>
            <h2 className="text-lg font-medium text-emerald-700">Zone couverte</h2>
            <p className="text-neutral-700">
              France métropolitaine. Pour les DOM-TOM ou l’international,
              contactez-nous pour un devis adapté.
            </p>
          </Reveal>

          <Reveal className="border-t pt-6 mt-6" delay={160}>
            <h2 className="text-lg font-medium text-emerald-700">Suivi & support</h2>
            <p className="text-neutral-700">
              Un email de suivi est envoyé dès l’expédition. Pour toute question :
            </p>
            <a
              href="mailto:commercial@vitalpetfrance.com"
              className="inline-block mt-2 text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
            >
              commercial@vitalpetfrance.com
            </a>
          </Reveal>
        </div>

        {/* Bandeau réassurance */}
        <Reveal
          className="mt-10 rounded-2xl bg-emerald-600 text-white text-center py-6 px-3 shadow-sm"
          delay={200}
        >
          <h3 className="text-lg font-medium">
            Livraison suivie — offerte dès 49 €
          </h3>
          <p className="mt-1 text-white/90">
            Emballages recyclables & transporteurs partenaires éco-responsables.
          </p>
        </Reveal>
      </div>
    </div>
  );
}

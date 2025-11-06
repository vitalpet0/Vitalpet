// src/components/CartToast.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

/**
 * Toast d'ajout au panier
 *
 * Props:
 * - open: boolean (affiché ou non)
 * - count: number (nombre total d'articles dans le panier)
 * - onClose: () => void (fermeture manuelle/auto)
 * - lastLabel?: string (nom du dernier produit ajouté — optionnel)
 * - autoHideMs?: number | null (durée avant auto-fermeture; null pour désactiver) — par défaut 2200ms
 */
export default function CartToast({
  open,
  count = 0,
  onClose,
  lastLabel,
  autoHideMs = 2200,
}) {
  // Auto hide
  useEffect(() => {
    if (!open || !autoHideMs) return;
    const t = setTimeout(() => onClose?.(), autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Respecte "réduire les animations"
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className={[
        // placement: centré mobile, bas-droite en md+
        "pointer-events-none fixed z-[60]",
        // safe-area iPhone : on garde au moins 1rem, ou le bord arrondi si plus grand
        "left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        // animation
        prefersReducedMotion
          ? ""
          : "transition-all duration-300 will-change-transform will-change-opacity",
        open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      ].join(" ")}
    >
      <div
        className={[
          "pointer-events-auto",
          // Style “verre dépoli” lisible
          "bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur",
          "text-white rounded-xl shadow-lg",
          // padding généreux + safe-area interne pour éviter le menton iPhone
          "px-4 py-3",
          "border border-white/10",
          // layout
          "flex items-center gap-3",
          // largeur max pour longues étiquettes
          "max-w-[92vw] md:max-w-none",
        ].join(" ")}
        // marge interne pour le safe area (en plus du bottom externe)
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        {/* pastille du compteur */}
        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-emerald-500 text-sm font-semibold px-2">
          {count}
        </span>

        {/* contenu texte */}
        <div className="text-sm min-w-0">
          <div className="font-medium">
            article{count > 1 ? "s" : ""} dans votre panier
          </div>
          {lastLabel ? (
            <div className="text-white/80 line-clamp-1 max-w-[50ch]">
              Ajouté : <span className="text-white">{lastLabel}</span>
            </div>
          ) : null}
        </div>

        {/* CTA panier : zone de tap large sur mobile */}
        <Link
          to="/cart"
          className="ml-2 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          Aller au panier <span aria-hidden>→</span>
          <span className="sr-only">Aller à la page panier</span>
        </Link>

        {/* bouton fermer : cible tactile ≥44px */}
        <button
          onClick={onClose}
          className="ml-1 grid place-items-center text-white/70 hover:text-white text-base h-9 w-9 rounded-md focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="Fermer la notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

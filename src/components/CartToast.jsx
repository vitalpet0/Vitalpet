// src/components/CartToast.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * Toast d'ajout au panier — compact, fond gris semi-flou
 */
export default function CartToast({
  open,
  count = 0,
  lastLabel,
  onClose,
  autoHideMs = 2000,
  offsetBottom = 60,
}) {
  const ref = useRef(null);

  // Auto-hide
  useEffect(() => {
    if (!open || !autoHideMs) return;
    const t = setTimeout(() => onClose?.(), autoHideMs);
    return () => clearTimeout(t);
  }, [open, autoHideMs, onClose]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // Swipe down (mobile)
  useEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    let startY = 0,
      moved = 0,
      dragging = false;

    const onStart = (e) => {
      dragging = true;
      startY = e.touches ? e.touches[0].clientY : e.clientY;
      moved = 0;
      el.style.transition = "none";
    };

    const onMove = (e) => {
      if (!dragging) return;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      moved = Math.max(0, y - startY);
      el.style.transform = `translate(-50%, ${Math.min(50, 8 + moved)}px)`;
      el.style.opacity = String(Math.max(0, 1 - moved / 100));
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      if (moved > 40) onClose?.();
      else {
        el.style.transition = reduce
          ? "none"
          : "opacity 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "translate(-50%, 0)";
        el.style.opacity = "1";
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [open, onClose, reduce]);

  const transition = reduce
    ? ""
    : "opacity 260ms cubic-bezier(0.22,1,0.36,1), transform 260ms cubic-bezier(0.22,1,0.36,1)";
  const bottomCSS = `calc(max(0.5rem, env(safe-area-inset-bottom)) + ${offsetBottom}px)`;

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed z-[120] pointer-events-none left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0"
      style={{
        bottom: bottomCSS,
        transition,
        transform: open
          ? "translate(-50%, 0) scale(1)"
          : "translate(-50%, 8px) scale(0.97)",
        opacity: open ? 1 : 0,
      }}
    >
      <div
        className={[
          "pointer-events-auto flex items-center gap-2",
          "rounded-lg backdrop-blur-md bg-neutral-800/80 text-white shadow-lg",
          "px-3 py-2 min-h-[38px] border border-white/10",
          "max-w-[300px]",
        ].join(" ")}
      >
        {/* pastille */}
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-emerald-500 text-[12px] font-semibold px-1.5">
          {count}
        </span>

        {/* texte */}
        <div className="text-[13px] leading-snug flex-1 min-w-0">
          <div className="font-medium">
            {count} article{count > 1 ? "s" : ""} ajouté
          </div>
          {lastLabel && (
            <div className="text-white/80 line-clamp-1">
              {lastLabel}
            </div>
          )}
        </div>

        {/* bouton panier */}
        <Link
          to="/cart"
          className="ml-auto text-[12px] font-medium text-white/90 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 focus:ring-2 focus:ring-white/40 focus:outline-none"
        >
          → 
        </Link>

        {/* bouton fermer */}
        <button
          onClick={onClose}
          className="ml-0.5 grid place-items-center text-white/70 hover:text-white text-sm h-7 w-7 rounded-md focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  );
}

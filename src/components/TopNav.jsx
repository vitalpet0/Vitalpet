// src/components/TopNav.jsx
import React, { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function TopNav() {
  const { count } = useCart();
  const ref = useRef(null);

  // Mesure la hauteur réelle de la nav et l’expose en CSS (--nav-h)
  useEffect(() => {
    const syncHeight = () => {
      const h = ref.current?.offsetHeight || 56;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    syncHeight();
    window.addEventListener("resize", syncHeight);
    return () => window.removeEventListener("resize", syncHeight);
  }, []);

  const linkBase =
    "px-3 py-1.5 rounded-lg text-sm hover:bg-neutral-100 transition";
  const active = "bg-neutral-900 text-white hover:bg-neutral-900";
  const inactive = "text-neutral-700";

  return (
    <nav
      ref={ref}
      className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b
                 pt-[env(safe-area-inset-top)]"
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 grid place-items-center text-white font-semibold">
            VP
          </div>
          <span className="font-semibold tracking-tight">VitalPet</span>
        </Link>

        {/* Liens */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
            end
          >
            Boutique
          </NavLink>

          <NavLink
            to="/box"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            VitalPet Box
          </NavLink>

        <NavLink
            to="/livraison"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            Livraison
          </NavLink>
        </div>

        {/* Panier */}
        <Link
          to="/cart"
          className="relative inline-flex items-center gap-2 rounded-lg bg-neutral-900 text-white px-3 py-1.5 text-sm hover:opacity-90"
          aria-label="Voir le panier"
        >
          <span>Panier</span>
          <span className="min-w-5 h-5 grid place-items-center rounded-md bg-white/15 text-xs">
            {count}
          </span>
        </Link>
      </div>
    </nav>
  );
}

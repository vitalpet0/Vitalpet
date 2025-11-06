// src/components/MobileTabs.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const cx = (...a) => a.filter(Boolean).join(" ");

function Tab({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          "flex flex-col items-center justify-center gap-1 py-2",
          "text-xs font-medium",
          isActive ? "text-emerald-600" : "text-neutral-600 hover:text-neutral-800"
        )
      }
      aria-label={label}
      end={to === "/"}
    >
      <Icon className="h-5 w-5" aria-hidden />
      <span>{label}</span>
    </NavLink>
  );
}

/* Icônes SVG minimalistes (stroke = currentColor) */
const StoreIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.8" d="M3 10.5V21h18V10.5M2.5 8l2-4h15l2 4M6 21v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6" />
  </svg>
);
const BoxIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.8" d="M3 7l9 4 9-4M3 7l9-4 9 4M3 7v10l9 4 9-4V7" />
  </svg>
);
const TruckIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.8" d="M3 6h10v8H7l-2 0M13 10h4l3 3v1h-3M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
  </svg>
);
const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}>
    <path strokeWidth="1.8" d="M3 5h2l2 11h10l2-7H7M9 20a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm8 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />
  </svg>
);

export default function MobileTabs() {
  return (
    <nav
      className={cx(
        // 👉 visible uniquement < 640px (téléphone)
        "sm:hidden print:hidden",
        "fixed inset-x-0 bottom-0 z-40 border-t",
        "bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      )}
      role="navigation"
      aria-label="Navigation principale mobile"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }} // encoche iOS
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-4 text-center">
          <Tab to="/" label="Boutique" Icon={StoreIcon} />
          <Tab to="/box" label="Box" Icon={BoxIcon} />
          <Tab to="/livraison" label="Livraison" Icon={TruckIcon} />
          <Tab to="/cart" label="Panier" Icon={CartIcon} />
        </div>
      </div>
    </nav>
  );
}

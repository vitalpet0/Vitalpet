// src/pages/Cart.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

/* ----------------- Reveal (même effet que la page Box) ----------------- */
function Reveal({ as: Tag = "div", delay = 0, className = "", children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVisible(true); return; }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const t = setTimeout(() => setVisible(true), delay);
            io.unobserve(el);
            return () => clearTimeout(t);
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
/* ---------------------------------------------------------------------- */

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='375'>
      <rect width='100%' height='100%' fill='#f1f5f9'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='18' fill='#64748b'
        text-anchor='middle' dominant-baseline='middle'>Aperçu produit</text>
    </svg>`
  );

/* -------- Helpers prix (robuste: HT+TVA ou TTC direct) -------- */
const DEFAULT_VAT = 20;
function unitPriceTTC(it) {
  // Si l'item a un prix HT + un taux, on calcule TTC
  if (typeof it.unitPriceHT === "number") {
    const rate = Number.isFinite(Number(it.taxRate)) ? Number(it.taxRate) : DEFAULT_VAT;
    return it.unitPriceHT * (1 + rate / 100);
  }
  // Sinon on considère `price` comme TTC
  return Number(it.price || 0);
}

function QtyControl({ value, onMinus, onPlus, onChange }) {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") { e.preventDefault(); onPlus(); }
    if (e.key === "ArrowDown") { e.preventDefault(); onMinus(); }
    if (e.key === "Enter") { e.currentTarget.blur(); }
  };

  return (
    <div
      className="
        inline-flex items-center gap-0 rounded-full border bg-white
        overflow-hidden shadow-sm
      "
      role="group"
      aria-label="Contrôle de quantité"
    >
      <button
        type="button"
        onClick={onMinus}
        disabled={v <= 0}
        className="
          h-10 w-10 grid place-items-center text-lg
          disabled:opacity-40 disabled:cursor-not-allowed
          hover:bg-neutral-50 active:scale-[0.98] transition
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
        "
        aria-label="Diminuer la quantité"
      >
        −
      </button>

      <input
        value={v}
        onChange={(e) => {
          const n = e.target.value.replace(/[^\d]/g, "");
          onChange(n === "" ? 0 : parseInt(n, 10));
        }}
        onKeyDown={handleKeyDown}
        inputMode="numeric"
        aria-live="polite"
        className="
          h-10 w-12 text-center tabular-nums
          bg-transparent outline-none
          border-x border-neutral-200
        "
      />

      <button
        type="button"
        onClick={onPlus}
        className="
          h-10 w-10 grid place-items-center text-lg
          hover:bg-neutral-50 active:scale-[0.98] transition
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40
        "
        aria-label="Augmenter la quantité"
      >
        +
      </button>
    </div>
  );
}

function Row({ item, onMinus, onPlus, onChange, onRemove }) {
  const up = unitPriceTTC(item);
  const line = (up * item.qty).toFixed(2);

  return (
    <div
      className="
        grid gap-3 items-center p-3 rounded-xl border bg-white
        grid-cols-[72px_1fr] 
        sm:grid-cols-[72px_1fr_auto_auto_auto]
      "
    >
      <img
        src={item.img || PLACEHOLDER_IMG}
        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
        alt={item.name}
        className="w-20 h-20 sm:w-[72px] sm:h-[72px] object-cover rounded-lg"
      />

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium truncate">{item.name}</div>
          <div className="sm:hidden text-right tabular-nums shrink-0">
            {up.toFixed(2)}€
          </div>
        </div>
        {item.brand && (
          <div className="text-xs text-neutral-500 truncate">{item.brand}</div>
        )}
      </div>

      <div className="hidden sm:block text-right tabular-nums">
        {up.toFixed(2)}€
      </div>

      <div className="flex items-center justify-end">
        <QtyControl
          value={item.qty}
          onMinus={onMinus}
          onPlus={onPlus}
          onChange={onChange}
        />
      </div>

      <div className="text-right tabular-nums font-semibold">{line}€</div>

      <button
        onClick={onRemove}
        className="col-span-2 sm:col-span-5 justify-self-end text-sm text-red-600 hover:text-red-700 mt-1"
        aria-label={`Retirer ${item.name}`}
        type="button"
      >
        Retirer
      </button>
    </div>
  );
}

export default function Cart() {
  // Si ton CartContext expose setCurrency / setShipping, on les utilise.
  const { items, updateQty, remove, clear } = useCart();
  const navigate = useNavigate();

  // ===== Prix =====
  const subtotal = useMemo(
    () => (items || []).reduce((s, it) => s + unitPriceTTC(it) * (Number(it.qty) || 0), 0),
    [items]
  );

  const [shippingMode, setShippingMode] = useState("standard");

  // Frais de port TTC
  const shippingTTC = useMemo(() => {
    if (!items || items.length === 0) return 0;
    if (subtotal >= 49) return 0;
    return shippingMode === "express" ? 7.9 : 4.9;
  }, [items, subtotal, shippingMode]);

  const total = useMemo(() => subtotal + shippingTTC, [subtotal, shippingTTC]);

  // ====== Préparation Checkout (HT + TVA) ======
  const VAT_RATE = DEFAULT_VAT;
  const currency = "EUR";

  // Normalise les lignes pour l’API (HT + TVA)
  const cartPayload = useMemo(
    () =>
      (items || []).map((it) => {
        // Si l’item est déjà en HT + taxRate, on réutilise.
        if (typeof it.unitPriceHT === "number") {
          return {
            id: it.id,
            sku: it.sku || it.id,
            title: it.name,
            quantity: Number(it.qty || 1),
            priceHT: Number(it.unitPriceHT),
            vat: Number(isFinite(it.taxRate) ? it.taxRate : VAT_RATE),
          };
        }
        // Sinon on convertit depuis TTC → HT avec le taux par défaut.
        const priceHT = VAT_RATE > 0 ? Number(it.price) / (1 + VAT_RATE / 100) : Number(it.price);
        return {
          id: it.id,
          sku: it.sku || it.id,
          title: it.name,
          quantity: Number(it.qty || 1),
          priceHT,
          vat: VAT_RATE,
        };
      }),
    [items]
  );

  // Livraison (HT + TVA)
  const shippingPayload = useMemo(() => {
    const amountHT =
      VAT_RATE > 0 ? Number(shippingTTC || 0) / (1 + VAT_RATE / 100) : Number(shippingTTC || 0);
    return {
      label: shippingMode === "express" ? "Livraison express" : "Livraison standard",
      amount: Number(amountHT || 0), // HT
      taxRate: VAT_RATE,
    };
  }, [shippingTTC, shippingMode]);

  // Persistance silencieuse pour Checkout (si Checkout lit localStorage)
  useEffect(() => {
    try {
      if (!items || items.length === 0) {
        localStorage.removeItem("cart");
        localStorage.removeItem("checkoutShipping");
        localStorage.setItem("currency", currency);
        return;
      }
      localStorage.setItem("cart", JSON.stringify(cartPayload));
      localStorage.setItem("checkoutShipping", JSON.stringify(shippingPayload));
      localStorage.setItem("currency", currency);
    } catch {
      // ignore
    }
  }, [items, cartPayload, shippingPayload]);

  if (!items || items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Reveal as="h1" className="text-3xl md:text-4xl font-semibold tracking-tight">
          Votre panier
        </Reveal>
        <Reveal delay={80} className="mt-6">
          <div className="rounded-2xl border bg-white p-8 text-center">
            <p className="text-neutral-600">Votre panier est vide.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
             <Link
               to="/box"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
           >
               Voir nos box
             </Link>
             <Link
            to="/"
               className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200"
             >
               Explorer la boutique
               
              </Link>
           </div>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 py-10 grid lg:grid-cols-[2fr_1fr] gap-6">
      {/* Liste des articles */}
      <section>
        <Reveal as="h1" className="text-3xl md:text-4xl font-semibold tracking-tight">
          Votre panier
        </Reveal>

        <div className="mt-4 space-y-3">
          {items.map((it, i) => (
            <Reveal key={it.id} delay={i * 60}>
              <Row
                item={it}
                onMinus={() => updateQty(it.id, Math.max(0, (Number(it.qty) || 0) - 1))}
                onPlus={() => updateQty(it.id, (Number(it.qty) || 0) + 1)}
                onChange={(v) => {
                  const n = Math.max(0, parseInt(v || "0", 10));
                  updateQty(it.id, n);
                }}
                onRemove={() => remove(it.id)}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                clear();
                try {
                  localStorage.removeItem("cart");
                  localStorage.removeItem("checkoutShipping");
                } catch {}
              }}
              className="text-sm text-neutral-600 hover:text-neutral-800"
              type="button"
            >
              Vider le panier
            </button>
            <Link to="/" className="text-sm text-emerald-700 hover:text-emerald-800">
              Continuer mes achats →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Récapitulatif */}
      <aside className="lg:sticky lg:top-6 h-max">
        <Reveal className="rounded-2xl border bg-white p-5">
          <h2 className="text-lg font-semibold">Récapitulatif</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="tabular-nums">{subtotal.toFixed(2)}€</span>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <span>Livraison</span>
                <select
                  value={shippingMode}
                  onChange={(e) => setShippingMode(e.target.value)}
                  className="rounded-md border px-2 py-1 text-sm"
                >
                  <option value="standard">Standard (2–5j)</option>
                  <option value="express">Express (24–48h)</option>
                </select>
              </label>
              <span className="tabular-nums">
                {shippingTTC === 0 ? "Offerte" : `${shippingTTC.toFixed(2)}€`}
              </span>
            </div>

            <div className="flex justify-between font-semibold pt-2 border-t mt-2">
              <span>Total</span>
              <span className="tabular-nums">{total.toFixed(2)}€</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 w-full h-11 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]"
            type="button"
          >
            Valider ma commande
          </button>

          <p className="text-xs text-neutral-500 mt-3">
            Livraison offerte dès 49€. Retours sous 14 jours. Paiement sécurisé.
          </p>
        </Reveal>
      </aside>
    </div>
  );
}

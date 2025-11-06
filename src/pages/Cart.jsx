// src/pages/Cart.jsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='500' height='375'>
      <rect width='100%' height='100%' fill='#f1f5f9'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='18' fill='#64748b'
        text-anchor='middle' dominant-baseline='middle'>Aperçu produit</text>
    </svg>`
  );

function Row({ item, onMinus, onPlus, onChange, onRemove }) {
  const line = (item.price * item.qty).toFixed(2);

  return (
    <div
      className="
        grid gap-3 items-center p-3 rounded-xl border bg-white
        grid-cols-[72px_1fr] 
        sm:grid-cols-[72px_1fr_auto_auto_auto]
      "
    >
      {/* Visuel */}
      <img
        src={item.img || PLACEHOLDER_IMG}
        onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMG)}
        alt={item.name}
        className="w-20 h-20 sm:w-[72px] sm:h-[72px] object-cover rounded-lg"
      />

      {/* Bloc titre + marque (et PRIX à droite sur mobile) */}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="font-medium truncate">{item.name}</div>
          {/* Prix unitaire visible à droite du titre sur mobile pour éviter le chevauchement */}
          <div className="sm:hidden text-right tabular-nums shrink-0">
            {item.price.toFixed(2)}€
          </div>
        </div>
        {item.brand && (
          <div className="text-xs text-neutral-500 truncate">{item.brand}</div>
        )}
      </div>

      {/* Prix unitaire (version desktop/tablette) */}
      <div className="hidden sm:block text-right tabular-nums">
        {item.price.toFixed(2)}€
      </div>

      {/* Contrôles quantité */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onMinus}
          className="w-7 h-7 rounded-md border grid place-items-center"
          aria-label="Diminuer la quantité"
        >
          −
        </button>
        <input
          value={item.qty}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 text-center rounded-md border py-1"
          inputMode="numeric"
          aria-label="Quantité"
        />
        <button
          onClick={onPlus}
          className="w-7 h-7 rounded-md border grid place-items-center"
          aria-label="Augmenter la quantité"
        >
          +
        </button>
      </div>

      {/* Total de ligne */}
      <div className="text-right tabular-nums font-semibold">{line}€</div>

      {/* Retirer */}
      <button
        onClick={onRemove}
        className="col-span-2 sm:col-span-5 justify-self-end text-sm text-red-600 hover:text-red-700 mt-1"
        aria-label={`Retirer ${item.name}`}
      >
        Retirer
      </button>
    </div>
  );
}

export default function Cart() {
  const { items, updateQty, remove, clear, subtotal } = useCart();
  const navigate = useNavigate();
  const [shippingMode, setShippingMode] = useState("standard");

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    if (subtotal >= 49) return 0;
    return shippingMode === "express" ? 7.9 : 4.9;
  }, [items.length, subtotal, shippingMode]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Votre panier</h1>
        <div className="mt-6 rounded-2xl border bg-white p-8 text-center">
          <p className="text-neutral-600">Votre panier est vide.</p>
          <Link to="/" className="inline-block mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            Explorer la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[2fr_1fr] gap-6">
      {/* Liste des articles */}
      <section>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Votre panier</h1>
        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <Row
              key={it.id}
              item={it}
              onMinus={() => updateQty(it.id, it.qty - 1)}
              onPlus={() => updateQty(it.id, it.qty + 1)}
              onChange={(v) => updateQty(it.id, v)}
              onRemove={() => remove(it.id)}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={clear} className="text-sm text-neutral-600 hover:text-neutral-800">
            Vider le panier
          </button>
          <Link to="/" className="text-sm text-emerald-700 hover:text-emerald-800">
            Continuer mes achats →
          </Link>
        </div>
      </section>

      {/* Récapitulatif */}
      <aside className="lg:sticky lg:top-6 h-max">
        <div className="rounded-2xl border bg-white p-5">
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
              <span className="tabular-nums">{shipping === 0 ? "Offerte" : `${shipping.toFixed(2)}€`}</span>
            </div>

            <div className="flex justify-between font-semibold pt-2 border-t mt-2">
              <span>Total</span>
              <span className="tabular-nums">{total.toFixed(2)}€</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="mt-4 w-full px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Valider ma commande
          </button>

          <p className="text-xs text-neutral-500 mt-3">
            Livraison offerte dès 49€. Retours sous 14 jours. Paiement sécurisé.
          </p>
        </div>
      </aside>
    </div>
  );
}

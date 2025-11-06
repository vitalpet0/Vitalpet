// src/pages/Product.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import PRODUCTS from "../data/products.js";
import { useCart } from "../context/CartContext.jsx";
import CartToast from "../components/CartToast.jsx";

const PH_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'>
      <rect width='100%' height='100%' fill='#f1f5f9'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='28' fill='#64748b'
        text-anchor='middle' dominant-baseline='middle'>Image non fournie</text>
    </svg>`
  );

function SafeImg({ src, alt, className }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={!src || err ? PH_IMG : src}
      alt={alt || "Produit"}
      className={className}
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add, items, count } = useCart();

  const product = useMemo(() => PRODUCTS.find(p => String(p.id) === String(id)), [id]);

  // titre de page
  useEffect(() => {
    document.title = product?.name ? `${product.name} – VitalPet` : "Produit – VitalPet";
  }, [product]);

  // compteur panier
  const cartCount = useMemo(() => {
    if (typeof count === "number") return count;
    if (Array.isArray(items)) return items.reduce((s, it) => s + (it?.qty ?? 1), 0);
    return 0;
  }, [count, items]);

  const [toastOpen, setToastOpen] = useState(false);
  const handleAdd = () => {
    if (!product) return;
    add(product, 1);
    setToastOpen(true);
  };

  // suggestions simples: mêmes cat/pet, autres IDs
  const related = useMemo(() => {
    if (!product) return [];
    return PRODUCTS
      .filter(p => p.id !== product.id && p.pet === product.pet && p.cat === product.cat)
      .slice(0, 8);
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <p className="text-neutral-600">Produit introuvable.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 rounded-xl border hover:bg-neutral-50"
        >
          ← Retour
        </button>
      </div>
    );
  }

  const hasPrice = typeof product.price === "number" && !Number.isNaN(product.price);
  const petLabel = product.pet === "chat" ? "Chat" : product.pet === "chien" ? "Chien" : "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* fil d’ariane */}
        <nav className="text-sm text-neutral-500 mb-6">
          <Link to="/" className="hover:underline">Boutique</Link>
          <span className="mx-2">/</span>
          <span>{petLabel}</span>
          {product.cat && (
            <>
              <span className="mx-2">/</span>
              <span>{product.cat}</span>
            </>
          )}
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <SafeImg
              src={product.img}
              alt={product.name}
              className="w-full h-[360px] object-cover rounded-2xl border bg-white"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{product.name}</h1>
            {product.brand && (
              <p className="mt-1 text-neutral-600 text-sm">Marque : <span className="font-medium">{product.brand}</span></p>
            )}
            <p className="mt-1 text-neutral-600 text-sm">
              {petLabel}{product.cat ? ` • ${product.cat}` : ""}{product.age ? ` • ${product.age}` : ""}
            </p>
            {product.feature && (
              <p className="mt-3 text-neutral-700">{product.feature}</p>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="text-2xl font-semibold">
                {hasPrice ? `${product.price.toFixed(2)}€` : "—"}
              </div>
              <button
                onClick={handleAdd}
                disabled={!hasPrice}
                className={
                  "px-5 py-3 rounded-xl text-sm " +
                  (hasPrice
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-neutral-200 text-neutral-500 cursor-not-allowed")
                }
                title={hasPrice ? "Ajouter au panier" : "Prix manquant"}
              >
                Ajouter au panier
              </button>
            </div>

            <div className="mt-4">
              <Link to="/cart" className="text-emerald-700 hover:underline text-sm">
                Voir mon panier →
              </Link>
            </div>
          </div>
        </div>

        {/* produits similaires */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold mb-4">Produits similaires</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map(r => (
                <Link
                  to={`/product/${r.id}`}
                  key={r.id}
                  className="rounded-2xl border bg-white overflow-hidden hover:shadow"
                >
                  <SafeImg src={r.img} alt={r.name} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <div className="text-xs text-neutral-500">{r.cat}</div>
                    <div className="font-medium line-clamp-2">{r.name}</div>
                    <div className="text-sm mt-1">{typeof r.price === "number" ? `${r.price.toFixed(2)}€` : "—"}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <CartToast
        open={toastOpen}
        count={cartCount}
        lastLabel={product.name}
        onClose={() => setToastOpen(false)}
        autoHideMs={null}
      />
    </div>
  );
}

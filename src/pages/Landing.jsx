// src/pages/Landing.jsx
import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useDeferredValue,
  startTransition,
} from "react";
import { Link } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import { useCart } from "../context/CartContext.jsx";
import PRODUCTS from "../data/products.js";
import CartToast from "../components/CartToast.jsx";
import { prefetchRoutesIdle, prefetchRoute } from "../utils/prefetchRoutes.js";

/* ---------- Reveal au scroll (respecte prefers-reduced-motion) ---------- */
function Reveal({ as: Tag = "div", delay = 0, className = "", children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
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

/* ---------- Utilitaires d'affichage ---------- */
const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <rect width='100%' height='100%' fill='#f1f5f9'/>
      <text x='50%' y='50%' font-family='sans-serif' font-size='22' fill='#64748b'
        text-anchor='middle' dominant-baseline='middle'>Image non fournie</text>
    </svg>`
  );

function SafeImg({ src, alt, className, sizes, fetchPriority = "auto" }) {
  const [err, setErr] = useState(false);
  return (
    <img
      src={!src || err ? PLACEHOLDER_IMG : src}
      alt={alt || "Produit"}
      className={className}
      loading="lazy"
      decoding="async"
      fetchpriority={fetchPriority}
      sizes={sizes || "(min-width:1024px) 20vw, (min-width:768px) 25vw, 50vw"}
      onError={() => setErr(true)}
    />
  );
}

/* ---------- Skeleton (chargement) ---------- */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] w-full bg-neutral-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-24 bg-neutral-200 rounded" />
        <div className="h-4 w-48 bg-neutral-200 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 w-16 bg-neutral-200 rounded" />
          <div className="h-8 w-20 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Carte produit (image + titre cliquables) ---------- */
const Card = React.memo(function Card({ p, onAdd }) {
  const hasPrice = typeof p.price === "number" && !Number.isNaN(p.price);
  const petLabel = p.pet === "chat" ? "Chat" : p.pet === "chien" ? "Chien" : "—";

  return (
    <div
      className="rounded-2xl border bg-white overflow-hidden flex flex-col"
      onMouseEnter={() => prefetchRoute("/product/:id")}
      onTouchStart={() => prefetchRoute("/product/:id")}
    >
      <Link to={`/product/${p.id}`} aria-label={`Voir ${p.name}`}>
        <div className="aspect-[4/3] w-full overflow-hidden">
          <SafeImg
            src={p.img}
            alt={p.name}
            className="w-full h-full object-cover"
            sizes="(min-width:1280px) 18vw, (min-width:1024px) 22vw, (min-width:768px) 30vw, 45vw"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="text-[11px] sm:text-xs text-neutral-500">
          {petLabel} • {p.cat || "Autre"}
        </div>

        <Link to={`/product/${p.id}`} className="block">
          <h3 className="text-sm sm:text-base font-medium mt-1 sm:mt-1.5 line-clamp-2">
            {p.name || "Produit"}
          </h3>
        </Link>

        {p.brand && (
          <p className="text-[11px] sm:text-xs text-neutral-500 mt-1">{p.brand}</p>
        )}

        <div className="mt-auto sm:mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-base sm:text-lg font-semibold">
            {hasPrice ? `${p.price.toFixed(2)}€` : "—"}
          </div>
          <button
            onClick={() => onAdd(p)}
            disabled={!hasPrice}
            className={
              "w-full sm:w-auto px-3 py-2 text-sm rounded-xl active:scale-[0.99] transition " +
              (hasPrice
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-neutral-200 text-neutral-500 cursor-not-allowed")
            }
            title={hasPrice ? "Ajouter au panier" : "Prix manquant"}
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
});

export default function Landing() {
  const { add, items, count } = useCart();

  /* ---------- SEO basique ---------- */
  useEffect(() => {
    document.title = "Boutique VitalPet — Croquettes, Litières, Friandises";
    const desc =
      "Achetez croquettes, litières et friandises pour chats et chiens. Livraison rapide. Programme fidélité VitalPet.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", desc);

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Store",
      name: "VitalPet",
      url: window.location.origin,
      department: "PetStore",
      openingHours: "Mo-Su 00:00-23:59",
      priceRange: "€",
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  /* ---------- Prefetch des pages probables depuis le landing ---------- */
  useEffect(() => {
    prefetchRoutesIdle(["/product/:id", "/cart", "/box"]);
  }, []);

  /* ---------- Scroll helper pour #produits ---------- */
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  /* ---------- Compteur du panier ---------- */
  const cartCount = useMemo(() => {
    if (typeof count === "number") return count;
    if (Array.isArray(items)) {
      return items.reduce((s, it) => s + (it?.qty ?? 1), 0);
    }
    return 0;
  }, [count, items]);

  /* ---------- Toast ---------- */
  const [toastOpen, setToastOpen] = useState(false);
  const [lastLabel, setLastLabel] = useState("");

  /* ---------- Filtres & tri ---------- */
  const [q, setQ] = useState("");
  const [pet, setPet] = useState("all");
  const [cat, setCat] = useState("all");
  const [brand, setBrand] = useState("all");
  const [age, setAge] = useState("all");
  const [sort, setSort] = useState("none");

  // Valeurs différées pour fluidifier l'UI durant les gros filtrages
  const dQ = useDeferredValue(q);
  const dPet = useDeferredValue(pet);
  const dCat = useDeferredValue(cat);
  const dBrand = useDeferredValue(brand);
  const dAge = useDeferredValue(age);
  const dSort = useDeferredValue(sort);

  const cats = useMemo(
    () => ["all", ...Array.from(new Set(PRODUCTS.map((p) => p.cat).filter(Boolean)))],
    []
  );
  const brands = useMemo(
    () => ["all", ...Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean)))],
    []
  );
  const ages = useMemo(
    () => ["all", ...Array.from(new Set(PRODUCTS.map((p) => p.age).filter(Boolean)))],
    []
  );

  const filtered = useMemo(() => {
    const ql = dQ.trim().toLowerCase();
    return PRODUCTS.filter((p) => {
      const okPet = dPet === "all" || p.pet === dPet;
      const okCat = dCat === "all" || p.cat === dCat;
      const okBrand = dBrand === "all" || p.brand === dBrand;
      const okAge = dAge === "all" || p.age === dAge;
      const matchQuery =
        ql === "" ||
        (p.name && p.name.toLowerCase().includes(ql)) ||
        (p.brand && p.brand.toLowerCase().includes(ql));
      return okPet && okCat && okBrand && okAge && matchQuery;
    });
  }, [dQ, dPet, dCat, dBrand, dAge]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (dSort === "price-asc")
      arr.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (dSort === "price-desc")
      arr.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    if (dSort === "name-asc")
      arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return arr;
  }, [filtered, dSort]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const handleAdd = (p) => {
    add(p, 1);
    setLastLabel(p?.name || "Produit");
    setToastOpen(true);
    prefetchRoute("/cart");
  };

  return (
    <div className="pt-safe has-bottom-nav min-h-screen-fix min-h-screen-ios bg-gradient-to-b from-emerald-50 via-white to-white">
      <TopNav />

      {/* --- HERO boutique --- */}
      <header className="relative">
        <img
          src="/img/croquettes.jpg"
          alt="Croquettes VitalPet"
          width={1600}
          height={900}
          className="w-full h-[52svh] md:h-[60vh] lg:h-[60vh] object-cover"
          decoding="async"
          sizes="100vw"
          fetchpriority="high"
          style={{ objectPosition: "center 40%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-transparent pointer-events-none" />
        <div className="absolute inset-0 grid place-content-center">
          <div className="max-w-7xl mx-auto px-6 translate-y-[4vh]">
            <Reveal className="max-w-[38rem] text-white text-center drop-shadow">
              <div className="inline-flex items-center gap-1 text-[11px] bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full mb-3">
                <span>Croquettes & friandises</span>
                <span className="opacity-70">•</span>
                <span>Accessoires</span>
                <span className="opacity-70">•</span>
                <span>Livraison rapide</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                La boutique essentielle pour votre compagnon
              </h1>
              <p className="mt-3 text-white/90 text-sm md:text-base">
                Alimentation, litière, hygiène et jeux — tout ce qu’il faut, au bon prix.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                  href="#produits"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId("produits");
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-sm font-medium"
                >
                  Parcourir les produits
                </a>
                <Link
                  to="/box"
                  onMouseEnter={() => prefetchRoute("/box")}
                  onTouchStart={() => prefetchRoute("/box")}
                  className="px-4 py-2 rounded-lg bg-white/90 text-neutral-900 text-sm font-medium hover:bg-white"
                >
                  Découvrir nos box
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* --- Filtres --- */}
      <Reveal as="section" className="max-w-7xl mx-auto px-4 pt-6">
        {/* Mobile (≤ lg) */}
        <div className="-mx-4 px-4 lg:hidden">
          <div className="flex gap-2 overflow-x-auto no-scrollbar scroller">
            <input
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setQ(v));
              }}
              placeholder="Rechercher…"
              className="flex-[1_0_60%] min-w-[60%] px-3 py-2 rounded-xl border"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
            />
            <select
              value={pet}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setPet(v));
              }}
              className="px-3 py-2 rounded-xl border"
            >
              <option value="all">Tous</option>
              <option value="chat">Chat</option>
              <option value="chien">Chien</option>
            </select>
            <select
              value={cat}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setCat(v));
              }}
              className="px-3 py-2 rounded-xl border"
            >
              {cats.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Catégories" : c}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar scroller">
            <select
              value={brand}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setBrand(v));
              }}
              className="px-3 py-1.5 rounded-full border text-sm"
            >
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b === "all" ? "Marques" : b}
                </option>
              ))}
            </select>
            <select
              value={age}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setAge(v));
              }}
              className="px-3 py-1.5 rounded-full border text-sm"
            >
              {ages.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "Âges" : a}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => {
                const v = e.target.value;
                startTransition(() => setSort(v));
              }}
              className="px-3 py-1.5 rounded-full border text-sm"
            >
              <option value="none">Tri</option>
              <option value="price-asc">Prix ↑</option>
              <option value="price-desc">Prix ↓</option>
              <option value="name-asc">Nom A→Z</option>
            </select>
          </div>
        </div>

        {/* Desktop (≥ lg) */}
        <div className="mt-6 hidden lg:grid lg:grid-cols-6 gap-3">
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => setQ(v));
            }}
            placeholder="Rechercher un produit…"
            className="px-3 py-2 rounded-xl border"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
          />
          <select
            value={pet}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => setPet(v));
            }}
            className="px-3 py-2 rounded-xl border"
          >
            <option value="all">Chat & Chien</option>
            <option value="chat">Chat</option>
            <option value="chien">Chien</option>
          </select>
          <select
            value={cat}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => setCat(v));
            }}
            className="px-3 py-2 rounded-xl border"
          >
            {cats.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Toutes catégories" : c}
              </option>
            ))}
          </select>
          <select
            value={brand}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => setBrand(v));
            }}
            className="px-3 py-2 rounded-xl border"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === "all" ? "Toutes marques" : b}
              </option>
            ))}
          </select>
          <select
            value={age}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => setAge(v));
            }}
            className="px-3 py-2 rounded-xl border"
          >
            {ages.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "Tous âges" : a}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              startTransition(() => setSort(v));
            }}
            className="px-3 py-2 rounded-xl border"
          >
            <option value="none">Tri : défaut</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="name-asc">Nom A → Z</option>
          </select>
        </div>
      </Reveal>

      {/* --- Grille produits --- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-8 rounded-2xl border bg-white text-center text-neutral-600">
            Aucun produit ne correspond.
          </div>
        ) : (
          <div
            id="produits"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 cv-auto"
            style={{ scrollMarginTop: 80 }}
          >
            {sorted.map((p, i) => (
              <Reveal key={p.id} delay={i * 40}>
                <Card p={p} onAdd={handleAdd} />
              </Reveal>
            ))}
          </div>
        )}
      </main>

      <CartToast
        open={toastOpen}
        count={cartCount}
        lastLabel={lastLabel}
        onClose={() => setToastOpen(false)}
        autoHideMs={null}
      />
    </div>
  );
}

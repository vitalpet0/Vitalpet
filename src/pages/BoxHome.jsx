// src/pages/BoxHome.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";
import { useCart } from "../context/CartContext.jsx";
// URL directe vers l'image iBB
const BOX_IMG_URL = "https://i.ibb.co/PsBfTg75/Chat-GPT-Image-10-nov-2025-21-10-12.png";


/* -------- Perf wrapper: rend la section seulement quand visible -------- */
function Defer({ as: Tag = "section", size = "1200px 900px", className = "", style, children, ...rest }) {
  return (
    <Tag
      className={className}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: size,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Reveal au scroll (respecte prefers-reduced-motion)
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

/* ----------------- Données ----------------- */
const PLANS = {
  chat: {
    Basic:   { base: 19, features: ["Croquettes + friandises + pâtée", "Litière", "1 jouet offert au choix"] },
    Confort: { base: 32, features: ["Tout en Basic", "Herbes à chat", "Hygiène (lingettes, spray, désodorisant)", "Brosse/peigne"] },
    Premium: { base: 49, features: ["Tout en Confort", "Compléments alimentaires", "Accessoire premium offert"] },
  },
  chien: {
    Basic:   { base: 19, features: ["Croquettes + friandises + pâtée", "Sacs à déjections", "1 jouet offert au choix"] },
    Confort: { base: 32, features: ["Tout en Basic", "Os à mâcher", "Hygiène (shampoing, lingettes)", "Brosse/peigne"] },
    Premium: { base: 49, features: ["Tout en Confort", "Tapis absorbant", "Compléments alimentaires", "Accessoire premium offert"] },
  },
};

/* --------------- Helpers UI ---------------- */
function cx(...a) { return a.filter(Boolean).join(" "); }

function SectionTitle({ kicker, title, subtitle }) {
  return (
    <div className="max-w-3xl mx-auto text-center">
      {kicker && <p className="text-sm tracking-widest uppercase text-neutral-500 mb-3">{kicker}</p>}
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900">{title}</h2>
      {subtitle && <p className="mt-3 text-neutral-600 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function SafeImg({ src, alt, className, style }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={
        error
          ? "data:image/svg+xml;utf8," +
            encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900"><rect width="100%" height="100%" fill="#ecfdf5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#10b981">VitalPet</text></svg>')
          : src
      }
      alt={alt}
      className={className}
      style={style}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
    />
  );
}

/* ----------------- Page ----------------- */
export default function BoxHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { add } = useCart(); // on n’utilise plus setCurrency / setShipping ici

  const [species, setSpecies] = useState("chat");
  const [tier, setTier] = useState("Confort");
  const [size, setSize] = useState("M");
  const [nbJouets, setNbJouets] = useState(1);
  const [litiereIncluse, setLitiereIncluse] = useState(true);
  const [bio, setBio] = useState(false);
  const [livraison, setLivraison] = useState("mensuelle"); // + "trimestrielle"

  /* ---------- Persistance: charger depuis localStorage ---------- */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("vp_config") || "{}");
      if (saved.espece) setSpecies(saved.espece);
      if (saved.formule) setTier(saved.formule);
      if (saved.taille) setSize(saved.taille);
      if (typeof saved.jouets !== "undefined") setNbJouets(saved.jouets);
      if (typeof saved.litiere !== "undefined") setLitiereIncluse(saved.litiere);
      if (typeof saved.bio !== "undefined") setBio(saved.bio);
      if (saved.freq) setLivraison(saved.freq);
    } catch {}
  }, []);

  /* ---------- Prix (HT) ---------- */
  // On traite ce prix comme un prix HT pour l’intégration Sellsy.
  const price = useMemo(() => {
    const base = PLANS[species][tier].base;
    const sizePlus =
      species === "chat" ? (size === "S" ? 0 : size === "M" ? 3 : 6) : size === "S" ? 0 : size === "M" ? 5 : 12;
    const litiere = species === "chat" && litiereIncluse ? 4 : 0;
    const jouets = Math.max(0, nbJouets - 1) * 3;
    const bioPlus = bio ? (tier === "Premium" ? 6 : 3) : 0;
    // Ajustement fréquence : mensuelle = 0, trimestrielle = -6
    const freq =
      livraison === "trimestrielle" ? -6 : 0;
    return Math.max(9, base + sizePlus + litiere + jouets + bioPlus + freq);
  }, [species, tier, size, litiereIncluse, nbJouets, bio, livraison]);

  /* ---------- Persistance: sauvegarder ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        "vp_config",
        JSON.stringify({
          espece: species, formule: tier, taille: size, jouets: nbJouets,
          litiere: litiereIncluse, bio, freq: livraison, prix: price
        })
      );
    } catch {}
  }, [species, tier, size, nbJouets, litiereIncluse, bio, livraison, price]);

  /* ---------- Paramètres pour /checkout (optionnel) ---------- */
  const params = useMemo(() => {
    const p = new URLSearchParams({
      espece: species, formule: tier, taille: size, jouets: String(nbJouets),
      bio: bio ? "1" : "0", freq: livraison, prix: String(price),
    });
    if (species === "chat") p.set("litiere", litiereIncluse ? "1" : "0");
    return p.toString();
  }, [species, tier, size, nbJouets, bio, livraison, price, litiereIncluse]);

  /* ---------- Helpers Panier / Checkout bridge ---------- */
  const DEFAULT_VAT = 20;
  const CURRENCY = "EUR";

  function buildBoxProduct() {
    const idParts = [
      "box",
      species,
      tier.toLowerCase(),
      size,
      bio ? "bio" : "std",
      species === "chat" ? (litiereIncluse ? "lit" : "nol") : "nlit",
      `j${nbJouets}`,
      livraison === "trimestrielle" ? "tri" : "mens",
    ];
    const id = idParts.join("-");

    const name =
      `Box ${species === "chat" ? "Chat" : "Chien"} — ${tier} (${size})` +
      (bio ? " • Bio" : "") +
      (species === "chat" && litiereIncluse ? " • Litière" : "") +
      (livraison === "trimestrielle" ? " • Trimestriel" : " • Mensuel");

    return {
      id,
      name,
      // NOTE: CartContext attend "price" pour le sous-total affiché
      price: Number(price) || 0, // on affiche le HT ici
      img: BOX_IMG_URL,
      qty: 1,
      // méta (non obligatoire)
      brand: undefined,
      meta: { species, tier, size, nbJouets, litiereIncluse: species === "chat" ? litiereIncluse : false, bio, livraison },
    };
  }

  // Ce que Checkout.jsx attend dans localStorage ("cart" + "checkoutShipping" + "currency")
  function buildCheckoutPayload() {
    return [{
      id: buildBoxProduct().id,
      sku: buildBoxProduct().id,
      title: buildBoxProduct().name,
      quantity: 1,
      priceHT: Number(price) || 0,
      vat: DEFAULT_VAT,
    }];
  }

  function persistForCheckout() {
    try {
      // panier pour Checkout
      localStorage.setItem("cart", JSON.stringify(buildCheckoutPayload()));
      // frais de port (HT)
      localStorage.setItem("checkoutShipping", JSON.stringify({
        label: "Livraison standard",
        amount: 4.9,
        taxRate: DEFAULT_VAT,
      }));
      // devise
      localStorage.setItem("currency", CURRENCY);
    } catch {}
  }

  // Ajoute la box au panier (context + persistance Checkout)
  const addToCart = () => {
    add(buildBoxProduct(), 1); // pour le badge + page Panier
    persistForCheckout();       // pour un accès direct /checkout
  };

  // Continuer → ajoute + navigue
  const goCheckout = () => {
    addToCart();
    navigate(`/checkout?${params}`);
  };
  // Ajoute la box puis ouvre la page Panier
const goCart = () => {
  addToCart();
  navigate("/cart");
};


  /* ---------- Scroll helpers ---------- */
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      setTimeout(() => scrollToId(id), 0);
    }
  }, [location.hash]);

  /* ----------------- Images ----------------- */
  const LITIERE_CUSTOM_URL = "https://i.ibb.co/LhbT8pfj/10683012.webp";
  const heroChat = "https://i.ibb.co/ns8RgZtn/chat-siberien.jpg";
  const heroChien = "https://i.ibb.co/wZx5fhqk/prix-chiens.jpg";
  const heroImg = species === "chat" ? heroChat : heroChien;
  const dogFood = "https://i.ibb.co/zhLxtT0w/chien-race-petite-taille-jpg.webp";
  const dogToy = "https://i.ibb.co/0p3JyY4W/Les-Friandises-naturelles-de-mastication-pour-chien-Tout-ce-que-vous-devez-savoir-Oria-Co-44052544.webp";
  const dogAccessory = "https://i.ibb.co/RTwDkXLT/accessoires-chien1.webp";

  return (
    <div className="pt-safe has-bottom-nav min-h-screen-fix min-h-screen-ios bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900">
      <TopNav />

      {/* --- HERO --- */}
      <header className="relative">
        <img
          src={heroImg}
          alt="Box VitalPet"
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 translate-y-[4vh]">
            <Reveal className="max-w-[38rem] text-white text-center drop-shadow">
              <div className="inline-flex items-center gap-1 text-[11px] bg-black/25 backdrop-blur-sm px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full mb-2 sm:mb-3">
                <span>Box VitalPet</span>
                <span className="opacity-70">•</span>
                <span>Livraison automatique</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold leading-tight">
                Votre box sur mesure pour votre compagnon
              </h1>
              <p className="mt-2 sm:mt-3 text-white/90 text-[13px] sm:text-sm md:text-base">
                Croquettes, friandises, jouets… livrés automatiquement selon ses besoins.
              </p>
              <div className="mt-4 sm:mt-5 flex flex-wrap justify-center gap-2">
                <a
                  href="#personnalisation"
                  onClick={(e) => { e.preventDefault(); scrollToId("personnalisation"); }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[13px] sm:text-sm font-medium"
                >
                  Je personnalise
                </a>
                <a
                  href="#plans"
                  onClick={(e) => { e.preventDefault(); scrollToId("plans"); }}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white/90 text-neutral-900 text-[13px] sm:text-sm font-medium hover:bg-white"
                >
                  Voir les formules
                </a>
                <Link
                  to="/livraison"
                  className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-white/15 text-white border border-white/25 text-[11px] sm:text-xs font-medium hover:bg-white/20"
                >
                  Livraison
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      {/* Switch species */}
      <section className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-neutral-100 rounded-2xl p-1 w-fit mx-auto">
          {["chat", "chien"].map((s) => (
            <button
              key={s}
              onClick={() => setSpecies(s)}
              className={cx(
                "px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[13px] sm:text-sm transition",
                species === s ? "bg-white shadow font-medium" : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              {s === "chat" ? "Je suis un humain de chat" : "Je suis un humain de chien"}
            </button>
          ))}
        </div>
      </section>

      {/* Plans */}
      <Defer
        as="section"
        id="plans"
        className="max-w-7xl mx-auto px-4 pb-6"
        size="1200px 1100px"
        style={{ scrollMarginTop: 80 }}
      >
        <SectionTitle
          kicker="Formules"
          title={species === "chat" ? "Pour les chats" : "Pour les chiens"}
          subtitle="Choisissez une base, personnalisez ensuite à votre rythme. Tarifs variables selon le profil et les préférences."
        />
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {Object.keys(PLANS[species]).map((name) => {
            const plan = PLANS[species][name];
            const isPopular = name === "Confort";
            return (
              <div
                key={name}
                className={cx(
                  "rounded-2xl border p-5 sm:p-6 bg-white relative transition-transform duration-300",
                  "hover:-translate-y-1 hover:shadow-lg",
                  isPopular && "ring-2 ring-emerald-500"
                )}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] sm:text-xs bg-emerald-600 text-white px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full shadow">Populaire</span>
                )}
                <h3 className="text-base sm:text-lg font-semibold">{name}</h3>
                <p className="mt-1 text-xs sm:text-sm text-neutral-600">À partir de</p>
                <div className="mt-1 text-2xl sm:text-3xl font-bold">
                  {plan.base}€<span className="text-sm sm:text-base font-normal text-neutral-500">/mois</span>
                </div>
                <ul className="mt-3 sm:mt-4 space-y-2 text-sm text-neutral-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setTier(name)}
                  className={cx(
                    "mt-5 sm:mt-6 w-full px-3 py-2 rounded-xl text-sm transition",
                    tier === name ? "bg-emerald-600 text-white" : "bg-neutral-100 hover:bg-neutral-200"
                  )}
                >
                  {tier === name ? "Sélectionné" : "Choisir"}
                </button>
              </div>
            );
          })}
        </div>
      </Defer>

      {/* Personnalisation */}
      <Defer
        as="section"
        id="personnalisation"
        className="max-w-7xl mx-auto px-4 py-8 sm:py-10"
        size="1200px 1200px"
        style={{ scrollMarginTop: 80 }}
      >
        <SectionTitle
          kicker="Personnalisation"
          title="Composez en 3 gestes"
          subtitle="Espèce → Taille → Options. Le reste peut être ajusté plus tard depuis votre compte."
        />
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8 items-start">
          {/* Carte options */}
          <div className="rounded-2xl border bg-white p-5 sm:p-6">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">Formule</p>
                <div className="grid grid-cols-3 gap-2">
                  {["Basic", "Confort", "Premium"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTier(t)}
                      className={cx("px-3 py-2 rounded-xl border text-sm transition", tier === t ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50")}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Taille de l'animal</p>
                <div className="flex gap-2">
                  {[
                    ["S", "Petit"],
                    ["M", "Moyen"],
                    ["L", "Grand"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setSize(v)}
                      className={cx("px-3 py-2 rounded-xl border text-sm transition", size === v ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-1">Indicatif : S (≤4 kg chat / ≤10 kg chien), M (5–8 kg / 11–25 kg), L (≥9 kg / ≥26 kg).</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Options</p>
                <div className="grid sm:grid-cols-3 gap-2">
                  {species === "chat" && (
                    <button
                      onClick={() => setLitiereIncluse(!litiereIncluse)}
                      className={cx(
                        "px-3 py-2 rounded-xl border text-sm flex items-center justify-between transition",
                        litiereIncluse ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      <span>Litière incluse</span><span className="text-xs opacity-70">+€</span>
                    </button>
                  )}
                  <div className="px-3 py-2 rounded-xl border border-neutral-200">
                    <label className="text-xs block">Jouets / mois</label>
                    <input type="range" min={0} max={3} value={nbJouets} onChange={(e) => setNbJouets(parseInt(e.target.value))} className="w-full mt-2" />
                    <div className="text-xs text-neutral-600">{nbJouets}</div>
                  </div>
                  <button
                    onClick={() => setBio(!bio)}
                    className={cx(
                      "px-3 py-2 rounded-xl border text-sm flex items-center justify-between transition",
                      bio ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    <span>Ingrédients bio/premium</span><span className="text-xs opacity-70">+€</span>
                  </button>
                </div>
              </div>

              {/* Fréquence avec bouton Trimestriel */}
              <div>
                <p className="text-sm font-medium mb-2">Fréquence</p>
                <div className="flex gap-2">
                  {[
                    ["mensuelle", "Chaque mois"],
                    ["trimestrielle", "Trimestriel (tous les 3 mois)"],
                  ].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setLivraison(v)}
                      className={cx(
                        "px-3 py-2 rounded-xl border text-sm transition",
                        livraison === v ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-neutral-50 rounded-xl border">
                <p className="text-sm text-neutral-600">Prix indicatif*</p>
                <div className="text-2xl sm:text-3xl font-semibold mt-1">
                  {price}€<span className="text-sm sm:text-base font-normal text-neutral-500">/mois</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">*Calculé selon la formule, la taille et vos options. Ajustable plus tard.</p>
              </div>

              {/* Actions – boutons plus compacts sur mobile */}
              <div className="flex gap-3">
  <button
    type="button"
    onClick={addToCart}
    className="px-4 py-2 rounded-xl bg-neutral-100 text-sm hover:bg-neutral-200"
  >
    Ajouter au panier
  </button>

  <button
    type="button"
    onClick={goCart}
    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm shadow hover:bg-emerald-700"
  >
    Continuer au panier
  </button>

  <a
    href="#faq"
    className="px-4 py-2 rounded-xl bg-neutral-100 text-sm hover:bg-neutral-200"
  >
    Questions
  </a>
</div>

            </div>
          </div>

          {/* Vignettes images */}
          <div className="grid sm:grid-cols-2 gap-4">
            {species === "chat" ? (
              <>
                <figure className="rounded-2xl overflow-hidden shadow sm:col-span-2 group">
                  <SafeImg src="https://i.ibb.co/JWSZJsdY/Adobe-Stock-144559561-1536x1022.webp" alt="Chat mangeant des croquettes" className="w-full h-56 object-cover" />
                  <figcaption className="text-xs p-2 text-neutral-500">Alimentation adaptée.</figcaption>
                </figure>
                <figure className="rounded-2xl overflow-hidden shadow group">
                  <SafeImg alt="Litière propre avec un chat" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]" src={LITIERE_CUSTOM_URL} />
                  <figcaption className="text-xs p-2 text-neutral-500">Litière incluse si souhaitée.</figcaption>
                </figure>
                <figure className="rounded-2xl overflow-hidden shadow group">
                  <img src="https://i.ibb.co/MdNY5Tq/meilleur-jouet-pour-chat.jpg" alt="Jouets sélectionnés." className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105 rounded-2xl" />
                  <figcaption className="text-xs p-2 text-neutral-500">Jouets sélectionnés.</figcaption>
                </figure>
              </>
            ) : (
              <>
                <figure className="rounded-2xl overflow-hidden shadow sm:col-span-2 group">
                  <SafeImg src={dogFood} alt="Chien mangeant des croquettes" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <figcaption className="text-xs p-2 text-neutral-500">Rations adaptées à sa taille.</figcaption>
                </figure>
                <figure className="rounded-2xl overflow-hidden shadow group">
                  <SafeImg src={dogToy} alt="Jouet pour chien" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <figcaption className="text-xs p-2 text-neutral-500">Jeu & mastication.</figcaption>
                </figure>
                <figure className="rounded-2xl overflow-hidden shadow group">
                  <SafeImg src={dogAccessory} alt="Accessoires pour chien" className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <figcaption className="text-xs p-2 text-neutral-500">Accessoires utiles.</figcaption>
                </figure>
              </>
            )}
          </div>
        </div>
      </Defer>

      {/* Bandeau fidélité */}
      <Defer as="section" className="max-w-7xl mx-auto px-4 pb-10" size="1200px 300px">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold">Programme fidélité</h3>
              <p className="mt-1 text-white/90">Cumulez des points à chaque box : cadeaux, promotions et surprises d'anniversaire pour votre compagnon.</p>
            </div>
            <a href="#" className="justify-self-start md:justify-self-end px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-sm">En savoir plus</a>
          </div>
        </div>
      </Defer>

      {/* FAQ */}
      <Defer as="section" id="faq" className="max-w-7xl mx-auto px-4 py-10" size="1200px 900px">
        <SectionTitle kicker="FAQ" title="Questions fréquentes" />
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {[
            { q: "Que contiennent les box ?", a: "Selon la formule et vos préférences : croquettes, friandises, litière (chats), produits d'hygiène, jouets et accessoires." },
            { q: "Puis-je modifier la box chaque mois ?", a: "Oui. Vous pouvez ajuster le contenu, la fréquence et mettre en pause la livraison." },
            { q: "Les tarifs sont-ils fixes ?", a: "Non, ils varient selon l'animal, la formule et la personnalisation. Le prix indicatif s'affiche avant paiement." },
            { q: "Livrez-vous partout en France ?", a: "Oui, avec suivi. Les délais moyens sont de 48–72h une fois la box expédiée." },
          ].map(({ q, a }) => (
            <details key={q} className="rounded-2xl border bg-white p-5 group">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-medium">{q}</span>
                <span className="text-emerald-600 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="mt-3 text-sm text-neutral-600">{a}</p>
            </details>
          ))}
        </div>
      </Defer>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-6 text-sm">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 grid place-items-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white">
                  <path fill="currentColor" d="M12 2c2.8 0 5 2.2 5 5 0 1.4-.6 2.7-1.6 3.6l-.1.1c1.8.4 3.2 2 3.2 4 0 2.3-1.9 4.2-4.2 4.2-.7 0-1.4-.2-2-.5-.6 1.4-2 2.4-3.6 2.4-2.2 0-4-1.8-4-4 0-1 .4-2 .9-2.7C3.7 13.7 3 12.5 3 11.1 3 8.3 5.2 6 8 6c.8 0 1.5.2 2.2.5C10.5 4.7 11.1 2 12 2z"/>
                </svg>
              </div>
              <span className="font-semibold">VitalPet</span>
            </div>
            <p className="text-neutral-600">Service d'abonnement mensuel personnalisable pour chiens et chats. Confort, hygiène et jeux livrés automatiquement.</p>
          </div>
          <div>
            <p className="font-medium mb-2">Produits</p>
            <ul className="space-y-1 text-neutral-600">
              <li>Croquettes & friandises</li>
              <li>Litière & hygiène</li>
              <li>Jouets & accessoires</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Aide</p>
            <ul className="space-y-1 text-neutral-600">
              <li><a href="#faq" className="hover:underline">FAQ</a></li>
              <li><a href="mailto:contact@vitalpetfrance.com" className="hover:underline">Contact</a></li>
              <li>
                <a
                  href="/cgv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 underline"
                >
                  CGV &amp; Confidentialité
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-neutral-500 text-center pb-8">
          © {new Date().getFullYear()} VitalPet Ltd
        </div>
      </footer>
    </div>
  );
}

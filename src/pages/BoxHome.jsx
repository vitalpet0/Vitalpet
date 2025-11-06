// src/pages/BoxHome.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import TopNav from "../components/TopNav.jsx";

/* ----------------- Données ----------------- */
const PLANS = {
  chat: {
    Basic: { base: 19, features: ["Croquettes + friandises + pâtée", "Litière", "1 jouet offert au choix"] },
    Confort: { base: 32, features: ["Tout en Basic", "Herbes à chat", "Hygiène (lingettes, spray, désodorisant)", "Brosse/peigne"] },
    Premium: { base: 49, features: ["Tout en Confort", "Compléments alimentaires", "Accessoire premium offert"] },
  },
  chien: {
    Basic: { base: 19, features: ["Croquettes + friandises + pâtée", "Sacs à déjections", "1 jouet offert au choix"] },
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
    />
  );
}

/* ----------------- Page ----------------- */
export default function BoxHome() {
  const navigate = useNavigate();
  const [species, setSpecies] = useState("chat");
  const [tier, setTier] = useState("Confort");
  const [size, setSize] = useState("M");
  const [nbJouets, setNbJouets] = useState(1);
  const [litiereIncluse, setLitiereIncluse] = useState(true);
  const [bio, setBio] = useState(false);
  const [livraison, setLivraison] = useState("mensuelle");

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

  /* ---------- Prix ---------- */
  const price = useMemo(() => {
    const base = PLANS[species][tier].base;
    const sizePlus =
      species === "chat" ? (size === "S" ? 0 : size === "M" ? 3 : 6) : size === "S" ? 0 : size === "M" ? 5 : 12;
    const litiere = species === "chat" && litiereIncluse ? 4 : 0;
    const jouets = Math.max(0, nbJouets - 1) * 3;
    const bioPlus = bio ? (tier === "Premium" ? 6 : 3) : 0;
    const freq = livraison === "bimestrielle" ? -4 : 0;
    return Math.max(9, base + sizePlus + litiere + jouets + bioPlus + freq);
  }, [species, tier, size, litiereIncluse, nbJouets, bio, livraison]);

  /* ---------- Persistance: sauvegarder ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(
        "vp_config",
        JSON.stringify({ espece: species, formule: tier, taille: size, jouets: nbJouets, litiere: litiereIncluse, bio, freq: livraison, prix: price })
      );
    } catch {}
  }, [species, tier, size, nbJouets, litiereIncluse, bio, livraison, price]);

  /* ---------- Querystring pour /checkout ---------- */
  const params = useMemo(() => {
    const p = new URLSearchParams({
      espece: species, formule: tier, taille: size, jouets: String(nbJouets),
      bio: bio ? "1" : "0", freq: livraison, prix: String(price),
    });
    if (species === "chat") p.set("litiere", litiereIncluse ? "1" : "0");
    return p.toString();
  }, [species, tier, size, nbJouets, bio, livraison, price, litiereIncluse]);

  const goCheckout = () => navigate(`/checkout?${params}`);

  /* ----------------- Images ----------------- */
  const LITIERE_CUSTOM_URL = "https://i.ibb.co/LhbT8pfj/10683012.webp";
  const heroChat = "https://i.ibb.co/ns8RgZtn/chat-siberien.jpg";
  const heroChien = "https://i.ibb.co/wZx5fhqk/prix-chiens.jpg";
  const heroImg = species === "chat" ? heroChat : heroChien;
  const dogFood = "https://i.ibb.co/zhLxtT0w/chien-race-petite-taille-jpg.webp";
  const dogToy = "https://i.ibb.co/0p3JyY4W/Les-Friandises-naturelles-de-mastication-pour-chien-Tout-ce-que-vous-devez-savoir-Oria-Co-44052544.webp";
  const dogAccessory = "https://i.ibb.co/RTwDkXLT/accessoires-chien1.webp";

  return (
    // ✅ safe-page ajoute un padding-top calculé (nav fixe + notch)
    <div className="safe-page min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900">
      <TopNav />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <SafeImg
          src={heroImg}
          alt="Animal heureux"
          className="w-full h-[42vh] md:h-[52vh] lg:h-[58vh] object-cover"
          style={species === "chat" ? { objectPosition: "center 35%" } : { objectPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-0">
            <div className="max-w-xl text-white drop-shadow">
              <div className="inline-flex items-center gap-2 text-xs bg-white/20 backdrop-blur px-3 py-1.5 rounded-full mb-4">
                <span>Livraison auto</span><span className="opacity-70">•</span><span>Box personnalisée</span><span className="opacity-70">•</span><span>Programme fidélité</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">La box mensuelle qui suit les besoins de votre compagnon</h1>
              <p className="mt-3 text-white/90">Croquettes, friandises, litière, jouets… Tout arrive automatiquement selon l’âge, le poids et les préférences.</p>
              <div className="mt-6 flex flex-wrap gap-3" id="commencer">
                <a href="#personnalisation" className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-sm font-medium">Je personnalise</a>
                <a href="#plans" className="px-5 py-3 rounded-xl bg-white/90 text-neutral-900 text-sm font-medium hover:bg-white">Voir les formules</a>
                <Link to={`/checkout?${params}`} className="px-5 py-3 rounded-xl bg-white/90 text-neutral-900 text-sm font-medium hover:bg-white">Livraison</Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Switch species */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-10">
        <div className="flex items-center justify-center gap-2 bg-neutral-100 rounded-2xl p-1 w-fit mx-auto">
          {["chat", "chien"].map((s) => (
            <button
              key={s}
              onClick={() => setSpecies(s)}
              className={cx("px-4 py-2 rounded-xl text-sm transition", species === s ? "bg-white shadow font-medium" : "text-neutral-600 hover:text-neutral-900")}
            >
              {s === "chat" ? "Je suis un humain de chat" : "Je suis un humain de chien"}
            </button>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-7xl mx-auto px-4 pb-6">
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
                  "rounded-2xl border p-6 bg-white relative transition-transform duration-300",
                  "hover:-translate-y-1 hover:shadow-lg",
                  isPopular && "ring-2 ring-emerald-500"
                )}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-emerald-600 text-white px-3 py-1 rounded-full shadow">Populaire</span>
                )}
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="mt-1 text-sm text-neutral-600">À partir de</p>
                <div className="mt-1 text-3xl font-bold">
                  {plan.base}€<span className="text-base font-normal text-neutral-500">/mois</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setTier(name)}
                  className={cx("mt-6 w-full px-4 py-2 rounded-xl text-sm transition", tier === name ? "bg-emerald-600 text-white" : "bg-neutral-100 hover:bg-neutral-200")}
                >
                  {tier === name ? "Sélectionné" : "Choisir"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Personnalisation */}
      <section id="personnalisation" className="max-w-7xl mx-auto px-4 py-10">
        <SectionTitle kicker="Personnalisation" title="Composez en 3 gestes" subtitle="Espèce → Taille → Options. Le reste peut être ajusté plus tard depuis votre compte." />
        <div className="grid lg:grid-cols-2 gap-8 mt-8 items-start">
          {/* Carte options */}
          <div className="rounded-2xl border bg-white p-6">
            <div className="space-y-6">
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
              <div>
                <p className="text-sm font-medium mb-2">Fréquence</p>
                <div className="flex gap-2">
                  {[["mensuelle", "Chaque mois"]].map(([v, label]) => (
                    <button
                      key={v}
                      onClick={() => setLivraison(v)}
                      className={cx("px-3 py-2 rounded-xl border text-sm transition", livraison === v ? "border-emerald-500 bg-emerald-50" : "border-neutral-200 hover:bg-neutral-50")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl border">
                <p className="text-sm text-neutral-600">Prix indicatif*</p>
                <div className="text-3xl font-semibold mt-1">
                  {price}€<span className="text-base font-normal text-neutral-500">/mois</span>
                </div>
                <p className="text-xs text-neutral-500 mt-1">*Calculé selon la formule, la taille et vos options. Ajustable plus tard.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goCheckout}
                  className="px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm shadow hover:bg-emerald-700"
                >
                  Continuer
                </button>
                <a href="#faq" className="px-5 py-3 rounded-xl bg-neutral-100 text-sm hover:bg-neutral-200">Questions</a>
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
      </section>

      {/* Bandeau fidélité */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold">Programme fidélité</h3>
              <p className="mt-1 text-white/90">Cumulez des points à chaque box : cadeaux, promotions et surprises d'anniversaire pour votre compagnon.</p>
            </div>
            <a href="#" className="justify-self-start md:justify-self-end px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-sm">En savoir plus</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-7xl mx-auto px-4 py-10">
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
      </section>

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
              <li>FAQ</li>
              <li>Contact</li>
              <li>CGV & Confidentialité</li>
            </ul>
          </div>
        </div>
        <div className="text-xs text-neutral-500 text-center pb-8">
          © {new Date().getFullYear()} VitalPet — Maquette concept. Images : Pexels.
        </div>
      </footer>
    </div>
  );
}

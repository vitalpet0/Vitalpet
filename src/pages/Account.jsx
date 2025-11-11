// src/pages/Account.jsx
import React, { useEffect, useState } from "react";
import supabase from "../lib/supabase.js";
import {
  LogOut,
  BadgeCheck,
  Shield,
  Mail,
  UserRound,
  ChevronDown,
  Info,
} from "lucide-react";

/* ------- Helpers ------- */
function useReveal(delay = 0) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) { setMounted(true); return; }
    const t = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return mounted;
}
const EUR = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    Number(n || 0)
  );
const freqLabel = (f) => {
  if (!f) return "";
  const f2 = f.toLowerCase();
  if (f2.startsWith("mens")) return "mensuelle";
  if (f2.startsWith("trimes")) return "trimestrielle";
  if (f2.startsWith("ann")) return "annuelle";
  return f;
};
const specieLabel = (s) => (s === "chat" ? "Chat" : s === "chien" ? "Chien" : s);

/* ------- UI bits ------- */
function StatusBadge({ status }) {
  const map = {
    active:     "bg-emerald-50 text-emerald-700 ring-emerald-200",
    paused:     "bg-amber-50  text-amber-700  ring-amber-200",
    canceled:   "bg-rose-50    text-rose-700   ring-rose-200",
    incomplete: "bg-sky-50     text-sky-700    ring-sky-200",
  };
  const cls = map[status] || map.incomplete;
  const label =
    status === "active" ? "actif" :
    status === "paused" ? "en pause" :
    status === "canceled" ? "annulé" : "incomplet";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ring-1 ${cls}`}>
      <BadgeCheck size={14} /> {label}
    </span>
  );
}

/* ------- Page ------- */
export default function Account() {
  const reveal = useReveal(70);
  const [user, setUser] = useState(null);
  const [subs, setSubs] = useState([]);
  const [open, setOpen] = useState({}); // { [id]: boolean }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(u?.user || null);

      if (u?.user?.id) {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", u.user.id)
          .order("created_at", { ascending: false });
        if (!alive) return;
        if (!error) setSubs(data || []);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/account?reset=1`,
    });
    alert("Un lien de réinitialisation vous a été envoyé par email.");
  };

  return (
    <div
      className={
        "min-h-screen bg-white transition-all duration-500 ease-out " +
        (reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
      }
    >
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center">
            <UserRound size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Mon compte</h1>
            {user?.email && (
              <p className="mt-0.5 text-sm text-neutral-600 flex items-center gap-1.5">
                <Mail size={14} /> {user.email}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-7xl mx-auto px-4 py-6 pb-28 md:pb-12">
        {/* Abonnements */}
        <section className="mb-6">
          <h2 className="text-base font-medium mb-3">Mes abonnements</h2>

          {loading ? (
            <div className="text-sm text-neutral-500">Chargement…</div>
          ) : subs.length === 0 ? (
            <div className="rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              Aucun abonnement actif.{" "}
              <a href="/box" className="text-emerald-700 font-medium underline">Je crée ma box</a>
            </div>
          ) : (
            <ul className="space-y-3">
              {subs.map((s) => {
                const tva = Number(s.vat_rate || 0);
                const ht  = Number(s.price_ht || 0);
                const ttc = ht * (1 + tva / 100);
                const created = s.created_at ? new Date(s.created_at) : null;
                const opened = !!open[s.id];

                return (
                  <li key={s.id} className="rounded-xl border bg-white">
                    {/* Ligne compacte */}
                    <div className="p-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {s.plan} · {specieLabel(s.species)} ({s.size})
                        </p>
                        <p className="text-sm text-neutral-600">
                          {freqLabel(s.frequency)} — {EUR(ht)} HT · TVA {tva}%
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={s.status} />
                        </div>
                      </div>

                      <button
                        onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-sm font-medium"
                        aria-expanded={opened}
                        aria-controls={`sub-details-${s.id}`}
                      >
                        <Info size={16} />
                        Plus d’infos
                        <ChevronDown
                          size={16}
                          className={
                            "transition-transform " + (opened ? "rotate-180" : "")
                          }
                        />
                      </button>
                    </div>

                    {/* Détails */}
                    <div
                      id={`sub-details-${s.id}`}
                      className={
                        "grid transition-[grid-template-rows,opacity] duration-300 ease-out " +
                        (opened
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0")
                      }
                    >
                      <div className="overflow-hidden">
                        <div className="px-4 pb-4 pt-0">
                          <div className="rounded-lg bg-neutral-50 border p-3 text-sm">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <p className="text-neutral-500">Formule</p>
                                <p className="font-medium">{s.plan}</p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Espèce</p>
                                <p className="font-medium">{specieLabel(s.species)}</p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Taille</p>
                                <p className="font-medium">{s.size}</p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Fréquence</p>
                                <p className="font-medium">{freqLabel(s.frequency)}</p>
                              </div>
                              <div>
                                <p className="text-neutral-500">Tarif HT</p>
                                <p className="font-medium">{EUR(ht)} / cycle</p>
                              </div>
                              <div>
                                <p className="text-neutral-500">TVA</p>
                                <p className="font-medium">{tva}%</p>
                              </div>
                              <div className="sm:col-span-2">
                                <p className="text-neutral-500">Montant TTC</p>
                                <p className="font-semibold">{EUR(ttc)} / {freqLabel(s.frequency)}</p>
                              </div>
                              {created && (
                                <div className="sm:col-span-2">
                                  <p className="text-neutral-500">Créé le</p>
                                  <p className="font-medium">
                                    {created.toLocaleDateString("fr-FR")}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* CTA secondaire éventuel */}
                            <div className="mt-3">
                              <a
                                href="/box"
                                className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
                              >
                                Ajuster ma box
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Actions compte */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <button
            onClick={resetPassword}
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm hover:bg-neutral-50"
          >
            <Shield size={16} /> Changer mon mot de passe
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 text-white px-3 py-2 text-sm hover:opacity-90"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </section>

        {/* Aide / Annulation */}
        <section className="rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <p className="mb-1 font-medium">Aide & annulation</p>
          <p className="leading-relaxed">
            Pour annuler l’abonnement, veuillez nous contacter au{" "}
            <a href="tel:+212600000000" className="font-medium underline">
              +212 6 00 00 00 00
            </a>{" "}
            ou par email :{" "}
            <a href="mailto:commercial@vitalpetltd.co" className="font-medium underline">
              commercial@vitalpetltd.co
            </a>.
          </p>
        </section>
      </main>
    </div>
  );
}

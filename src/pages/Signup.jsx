// src/pages/Signup.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase.js";
import { ShieldPlus, Mail, Lock, UserPlus, Info } from "lucide-react";

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

export default function Signup() {
  const navigate = useNavigate();
  const reveal = useReveal(80);

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'error'|'success', text }

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (pwd !== pwd2) {
      setMsg({ type: "error", text: "Les mots de passe ne correspondent pas." });
      return;
    }
    if (pwd.length < 8) {
      setMsg({ type: "error", text: "Mot de passe trop court (min. 8 caractères)." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pwd,
      options: {
        emailRedirectTo: `${window.location.origin}/account?confirm=1`,
      },
    });
    setLoading(false);

    if (error) {
      setMsg({ type: "error", text: error.message || "Impossible de créer le compte." });
      return;
    }

    setMsg({
      type: "success",
      text: "Compte créé ! Vérifie ton email pour confirmer l’inscription.",
    });

    // On laisse l’utilisateur lire le message puis on l’envoie sur /login
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div
      className={
        "min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white transition-all duration-600 ease-out " +
        (reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")
      }
    >
      {/* Entête */}
      <header className="bg-white/60 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white grid place-items-center">
              <ShieldPlus size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Créer un compte</h1>
              <p className="text-sm text-neutral-600">
                Accède à tes abonnements, suivis et avantages fidélité.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Formulaire */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-10">
        <div className="max-w-md mx-auto rounded-2xl border bg-white p-5 shadow-sm">
          {msg && (
            <div
              className={
                "mb-4 rounded-lg px-3 py-2 text-sm " +
                (msg.type === "error"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200")
              }
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="email@exemple.com"
                autoComplete="email"
              />
            </div>

            <label className="block text-sm font-medium">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
              <input
                type="password"
                required
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <label className="block text-sm font-medium">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2" size={16} />
              <input
                type="password"
                required
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-start gap-2 text-xs text-neutral-600 bg-neutral-50 rounded-xl px-3 py-2 border">
              <Info size={14} className="mt-0.5 shrink-0" />
              <p>
                Utilise au moins 8 caractères. Tu recevras un email pour confirmer ton inscription.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              <UserPlus size={16} /> {loading ? "Création…" : "S’inscrire"}
            </button>
          </form>

          <div className="mt-3 text-sm text-center">
            <span className="text-neutral-600">J’ai déjà un compte </span>
            <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-medium">
              Me connecter
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

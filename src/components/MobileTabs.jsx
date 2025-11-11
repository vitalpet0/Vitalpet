// src/components/MobileTabs.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import supabase from "../lib/supabase.js";
import { Home, Box, Truck, ShoppingCart, User } from "lucide-react";

function Tab({ to, label, icon: Icon, active }) {
  return (
    <Link
      to={to}
      className={
        "flex-1 flex flex-col items-center justify-center py-2 text-[11px] transition-colors " +
        (active ? "text-emerald-700 font-medium" : "text-neutral-600 hover:text-neutral-800")
      }
    >
      <Icon size={20} strokeWidth={1.8} className="mb-0.5" />
      {label}
    </Link>
  );
}

export default function MobileTabs() {
  const { pathname } = useLocation();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted) setLoggedIn(!!data?.user);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_evt, session) => {
        if (mounted) setLoggedIn(!!session?.user);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const accountHref = loggedIn ? "/account" : "/login";

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t z-40 md:hidden">
      <div className="flex px-2">
        <Tab to="/" label="Boutique" icon={Home} active={pathname === "/"} />
        <Tab
          to="/box"
          label="Box"
          icon={Box}
          active={pathname.startsWith("/box")}
        />
        <Tab
          to={accountHref}
          label="Compte"
          icon={User}
          active={
            pathname.startsWith("/account") || pathname.startsWith("/login")}
          />
        <Tab
          to="/livraison"
          label="Livraison"
          icon={Truck}
          active={pathname.startsWith("/livraison")}
        />
        <Tab
          to="/cart"
          label="Panier"
          icon={ShoppingCart}
          active={pathname.startsWith("/cart")}
        />
        
      </div>
    </nav>
  );
}

// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MobileTabs from "./components/MobileTabs.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import { prefetchRoutesIdle } from "./utils/prefetchRoutes.js";

import RequireAuth from "./components/RequireAuth.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Account from "./pages/Account.jsx";

// Lazy pages
const Landing   = lazy(() => import("./pages/Landing.jsx"));
const BoxHome   = lazy(() => import("./pages/BoxHome.jsx"));
const Product   = lazy(() => import("./pages/Product.jsx"));
const Cart      = lazy(() => import("./pages/Cart.jsx"));
const Checkout  = lazy(() => import("./pages/Checkout.jsx"));
const Livraison = lazy(() => import("./pages/Livraison.jsx"));
const CGV       = lazy(() => import("./pages/CGV.jsx")); // <-- ajouté

export default function App() {
  // Préchargement “idle” de quelques routes fréquentes
  useEffect(() => {
    prefetchRoutesIdle(["/checkout", "/cart", "/livraison", "/cgv"]); // /cgv ajouté
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div style={{ padding: 16 }}>Chargement...</div>}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/box" element={<BoxHome />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/livraison" element={<Livraison />} />
          <Route path="/cgv" element={<CGV />} /> {/* <-- route ajoutée */}

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />

          {/* Fallback 404 → accueil */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>

      {/* Onglets bas (mobile) */}
      <MobileTabs />
    </BrowserRouter>
  );
}

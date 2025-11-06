// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import BoxHome from "./pages/BoxHome.jsx";
import Checkout from "./pages/Checkout.jsx";
import Livraison from "./pages/Livraison.jsx";
import Cart from "./pages/Cart.jsx";
import Product from "./pages/Product.jsx";
import MobileTabs from "./components/MobileTabs.jsx"; // ⟵ AJOUT

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/box" element={<BoxHome />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/livraison" element={<Livraison />} />
        <Route path="*" element={<Landing />} />
      </Routes>

      {/* Barre d’onglets mobile */}
      <MobileTabs />
    </>
  );
}
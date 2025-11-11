// src/utils/prefetchRoutes.js

// Polyfill simple pour Safari et anciens navigateurs
const rIC =
  typeof window !== "undefined" && window.requestIdleCallback
    ? window.requestIdleCallback
    : (cb) => setTimeout(() => cb({ timeRemaining: () => 0 }), 1);

// IMPORTANT : ces chemins doivent correspondre aux import() utilisés dans App.jsx
const loaders = {
  "/":           () => import("../pages/Landing.jsx"),
  "/box":        () => import("../pages/BoxHome.jsx"),
  "/product/:id":() => import("../pages/Product.jsx"),
  "/cart":       () => import("../pages/Cart.jsx"),
  "/checkout":   () => import("../pages/Checkout.jsx"),
  "/livraison":  () => import("../pages/Livraison.jsx"),
};

const cache = new Set();

/**
 * Précharge une route spécifique (lazy import)
 */
export function prefetchRoute(path) {
  if (cache.has(path) || !loaders[path]) return;
  cache.add(path);
  rIC(() => {
    try {
      loaders[path]();
    } catch {
      cache.delete(path);
    }
  });
}

/**
 * Précharge plusieurs routes quand le navigateur est idle
 */
export function prefetchRoutesIdle(paths = []) {
  rIC(() => {
    paths.forEach(prefetchRoute);
  });
}

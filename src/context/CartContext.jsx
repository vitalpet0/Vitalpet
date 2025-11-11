// src/context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

/**
 * Modèle interne d’un item du panier
 * {
 *   id: string,
 *   sku?: string,
 *   name: string,
 *   img?: string,
 *   qty: number,
 *   unitPriceHT: number,   // prix hors taxe, par unité
 *   taxRate: number,       // en %, ex: 20
 *   meta?: Record<string, any>
 * }
 */

const CartCtx = createContext(null);

const STORAGE_KEY = "vp_cart_v1";
const STORAGE_META_KEY = "vp_cart_meta_v1";

const isBrowser = typeof window !== "undefined";
const DEFAULT_VAT = 20;

function safeRead(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Normalise/migre un item quelconque vers notre format interne
function normalizeItem(x) {
  if (!x) return null;
  const id = x.id ?? x.sku ?? String(Date.now());
  const unitPriceHT =
    x.unitPriceHT != null
      ? Number(x.unitPriceHT)
      : x.price_ht != null
      ? Number(x.price_ht)
      : x.price != null
      ? Number(x.price)
      : 0;

  const taxRate =
    x.taxRate != null
      ? Number(x.taxRate)
      : x.vat != null
      ? Number(x.vat)
      : DEFAULT_VAT;

  return {
    id,
    sku: x.sku ?? x.id ?? null,
    name: x.name ?? x.label ?? "Article",
    img: x.img ?? x.image ?? null,
    qty: Math.max(1, Number(x.qty || 1)),
    unitPriceHT: Number(unitPriceHT || 0),
    taxRate: Number.isFinite(taxRate) ? taxRate : DEFAULT_VAT,
    meta: x.meta ?? {},
  };
}

export function CartProvider({ children }) {
  // Items (avec migration éventuelle)
  const [items, setItems] = useState(() => {
    const raw = safeRead(STORAGE_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeItem).filter(Boolean);
  });

  // Métadonnées (devise + livraison)
  const [meta, setMeta] = useState(() =>
    safeRead(STORAGE_META_KEY, {
      currency: "EUR",
      shipping: {
        label: "Livraison standard",
        amount: 4.9, // HT
        taxRate: DEFAULT_VAT,
      },
    })
  );

  // Persistances “source de vérité”
  useEffect(() => safeWrite(STORAGE_KEY, items), [items]);
  useEffect(() => safeWrite(STORAGE_META_KEY, meta), [meta]);

  // ---------- Bridge vers Checkout (localStorage.cart / currency / checkoutShipping) ----------
  useEffect(() => {
    try {
      const checkoutCart = items.map((x) => ({
        sku: x.sku ?? x.id ?? "",
        name: x.name ?? "Article",
        quantity: Number(x.qty || 0),
        priceHT: Number(x.unitPriceHT || 0), // HT pour Checkout.jsx
        vat: Number(x.taxRate || 0),
      }));
      localStorage.setItem("cart", JSON.stringify(checkoutCart));
      localStorage.setItem("currency", meta.currency || "EUR");
      localStorage.setItem(
        "checkoutShipping",
        JSON.stringify({
          label: meta?.shipping?.label || "Livraison",
          amount: Number(meta?.shipping?.amount || 0), // HT
          taxRate: Number(meta?.shipping?.taxRate ?? DEFAULT_VAT),
        })
      );
    } catch {}
  }, [items, meta]);

  // ---------- Mutations Produits ----------
  const add = useCallback((product, qty = 1) => {
    const normalized = normalizeItem({ ...product, qty: Math.max(1, Number(qty) || 1) });
    if (!normalized) return;

    setItems((prev) => {
      const i = prev.findIndex(
        (x) => (x.id ?? x.sku) === (normalized.id ?? normalized.sku)
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = {
          ...next[i],
          // somme des quantités (capée à 99)
          qty: Math.min(99, Number(next[i].qty || 0) + Number(normalized.qty || 1)),
          // on fixe HT/TVA au passage si absent
          unitPriceHT:
            Number.isFinite(next[i].unitPriceHT) ? next[i].unitPriceHT : normalized.unitPriceHT,
          taxRate:
            Number.isFinite(next[i].taxRate) ? next[i].taxRate : normalized.taxRate,
        };
        return next;
      }
      return [...prev, normalized];
    });
  }, []);

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    const n = Math.max(0, Math.min(99, Number(qty) || 0));
    setItems((prev) => {
      if (n === 0) return prev.filter((x) => x.id !== id);
      return prev.map((x) => (x.id === id ? { ...x, qty: n } : x));
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // ---------- Livraison / Devise ----------
  const setCurrency = useCallback((currency) => {
    setMeta((m) => ({ ...m, currency: currency || "EUR" }));
  }, []);

  const setShipping = useCallback((shipping) => {
    setMeta((m) => ({
      ...m,
      shipping: {
        label: shipping?.label ?? m.shipping.label ?? "Livraison",
        amount: Number(shipping?.amount ?? m.shipping.amount ?? 0),
        taxRate: Number(
          shipping?.taxRate ?? m.shipping.taxRate ?? DEFAULT_VAT
        ),
      },
    }));
  }, []);

  // ---------- Totaux ----------
  const subtotalHT = useMemo(
    () =>
      items.reduce(
        (s, x) => s + Number(x.unitPriceHT || 0) * Number(x.qty || 0),
        0
      ),
    [items]
  );

  const itemsTVA = useMemo(
    () =>
      items.reduce((s, x) => {
        const ht = Number(x.unitPriceHT || 0) * Number(x.qty || 0);
        const tva = ht * (Number(x.taxRate || 0) / 100);
        return s + tva;
      }, 0),
    [items]
  );

  const shippingHT = Number(meta.shipping?.amount || 0);
  const shippingTVA = shippingHT * (Number(meta.shipping?.taxRate || 0) / 100);

  const totalHT = useMemo(() => subtotalHT + shippingHT, [subtotalHT, shippingHT]);
  const totalTVA = useMemo(() => itemsTVA + shippingTVA, [itemsTVA, shippingTVA]);
  const totalTTC = useMemo(() => totalHT + totalTVA, [totalHT, totalTVA]);

  const count = useMemo(
    () => items.reduce((s, x) => s + Number(x.qty || 0), 0),
    [items]
  );

  // ---------- Helpers pour l’API Sellsy ----------
  const getNormalizedItems = useCallback(() => {
    return items.map((x) => ({
      sku: x.sku ?? x.id ?? "",
      name: x.name ?? "Article",
      qty: Number(x.qty || 0),
      unitPrice: Number(x.unitPriceHT || 0), // HT
      taxRate: Number(x.taxRate || 0),
    }));
  }, [items]);

  const getSellsyPayload = useCallback(() => {
    return {
      cart: getNormalizedItems(),
      currency: meta.currency || "EUR",
      shipping: {
        label: meta?.shipping?.label || "Livraison",
        amount: Number(meta?.shipping?.amount || 0),
        taxRate: Number(meta?.shipping?.taxRate ?? DEFAULT_VAT),
      },
    };
  }, [getNormalizedItems, meta]);

  // ---------- Ajout d’une box (bundle) ----------
  const addBox = useCallback(
    (config) => {
      if (!config?.items || !Array.isArray(config.items)) return;
      for (const it of config.items) add(it, it.qty ?? 1);
    },
    [add]
  );

  const value = {
    // état
    items,
    meta,
    currency: meta.currency,
    shipping: meta.shipping,

    // mutations
    add,
    addBox,
    remove,
    updateQty,
    clear,
    setCurrency,
    setShipping,

    // totaux
    count,
    subtotalHT,
    itemsTVA,
    shippingHT,
    shippingTVA,
    totalHT,
    totalTVA,
    totalTTC,

    // helpers API
    getNormalizedItems,
    getSellsyPayload,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

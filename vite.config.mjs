import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Prod = domaine à la racine → base = "/"
export default defineConfig({
  plugins: [react()],
  base: "/",                 // ← important pour que les assets chargent en prod
  build: { outDir: "dist", sourcemap: true }, // sourcemap pour voir l’erreur réelle en prod
  server: {
    host: true,
    port: 5173,
    proxy: { "/api": "http://localhost:3000" }, // dev seulement
  },
});

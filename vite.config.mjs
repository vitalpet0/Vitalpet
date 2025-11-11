import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",                 // important pour prod (URLs absolues)
  build: { outDir: "dist", sourcemap: true }, // sourcemap pour débugger la prod
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000" // pour dev uniquement
    }
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Only include Replit plugins in development when available
    ...(process.env.NODE_ENV === "development" && process.env.REPL_ID 
      ? (() => {
          try {
            const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");
            return [runtimeErrorOverlay.default()];
          } catch {
            return [];
          }
        })()
      : [])
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});

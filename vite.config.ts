import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    // Increase limit to silence warnings for known larger chunks
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom"))
              return "vendor-react";
            if (id.includes("leaflet")) return "vendor-leaflet";
            if (id.includes("@supabase")) return "vendor-supabase";
            if (id.includes("i18next") || id.includes("react-i18next"))
              return "vendor-i18n";
            return "vendor";
          }
        },
      },
    },
  },
}));

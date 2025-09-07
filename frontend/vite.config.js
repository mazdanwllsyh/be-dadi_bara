import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ command }) => ({
  plugins: [react(), process.env.ANALYZE ? visualizer({ open: true }) : null],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": [
            "react",
            "react-dom",
            "react-router-dom",
            "react-router-hash-link",
          ],
          "bootstrap-vendor": ["react-bootstrap", "bootstrap"],
          "utils-vendor": ["axios", "jwt-decode"],
          "notifications-vendor": [
            "react-toastify",
            "sweetalert2",
            "sweetalert2-react-content",
          ],
          "animations-icons-vendor": ["aos", "react-icons"],
          "seo-vendor": ["react-helmet-async"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));

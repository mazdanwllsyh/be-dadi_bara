import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
    }),
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
    }),
    process.env.ANALYZE ? visualizer({ open: true }) : null,
  ],
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-bootstrap")) {
              return "vendor_react-bootstrap";
            }
            if (id.includes("aos")) {
              return "vendor_aos";
            }
            return "vendor";
          }
        },
      },
    },
  },
}));

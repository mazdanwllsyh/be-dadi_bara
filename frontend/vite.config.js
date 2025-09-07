import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ command }) => ({
  plugins: [react(), process.env.ANALYZE ? visualizer({ open: true }) : null],
  build: {
    chunkSizeWarningLimit: 1000,
  },
}));

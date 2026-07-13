import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(() => ({
  base: "/web-packages",
  experimental: {
    bundledDev: true,
  },
  plugins: [vanillaExtractPlugin(), react()],
  resolve: {
    tsconfigPaths: true,
  },
}));

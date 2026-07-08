import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/web-packages/" : "/",
  plugins: [vanillaExtractPlugin(), react()],
  resolve: {
    tsconfigPaths: true,
  },
}));

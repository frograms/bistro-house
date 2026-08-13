import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

import { DEMO_API_FIXTURES } from "./src/component/view/package/react-fetch-devtools/_shared/demo-api-fixtures";

const DEMO_API_DELAY_MS = 200;

const demoApiPlugin = (): Plugin => ({
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? "").split("?")[0];
      const path = Object.keys(DEMO_API_FIXTURES).find(
        (candidate) =>
          url === candidate || url === `/web-packages${candidate}`
      );
      if (path === undefined) {
        next();
        return;
      }
      setTimeout(() => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(DEMO_API_FIXTURES[path]));
      }, DEMO_API_DELAY_MS);
    });
  },
  generateBundle() {
    for (const [path, data] of Object.entries(DEMO_API_FIXTURES)) {
      this.emitFile({
        fileName: path.slice(1),
        source: JSON.stringify(data, null, 2),
        type: "asset",
      });
    }
  },
  name: "demo-api",
});

// https://vite.dev/config/
export default defineConfig(() => ({
  base: "/web-packages",
  experimental: {
    bundledDev: true,
  },
  plugins: [vanillaExtractPlugin(), react(), demoApiPlugin()],
  resolve: {
    tsconfigPaths: true,
  },
}));
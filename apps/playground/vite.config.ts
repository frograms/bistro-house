import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type UserConfig } from "vite";

import { DEMO_API_FIXTURES } from "./src/component/view/package/react-http-override/_shared/demo-api-fixtures";

type BuildConfig = "development" | "production";

const buildOptionInfo: Record<BuildConfig, UserConfig> = {
  development: {
    build: {
      rolldownOptions: {
        experimental: {
          devMode: {
            /**
             * - bundledDev lazy proxy가 non-root base를 붙이지 않아 /@vite/lazy 404가 난다 (vitejs/vite#23216).
             * - prod 코드스플리팅과 무관한 devMode 옵션이라 임시로 끈다.
             * - TODO: 확인 후 나중에 재 활성화
             */
            lazy: false,
          },
        },
      },
    },
  },
  production: {},
};

const DEMO_API_DELAY_MS = 200;

const DEMO_WISH_PATH = /^(?:\/web-packages)?\/api\/contents\/([^/]+)\/wishes$/;

const demoApiPlugin = (): Plugin => ({
  configureServer(server) {
    // 찜 POST, DELETE 데모. 서버가 켜져 있는 동안만 메모리에 상태를 둔다
    const wished = new Set<string>();
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? "").split("?")[0];
      const wishMatch = DEMO_WISH_PATH.exec(url);
      if (wishMatch !== null && (req.method === "POST" || req.method === "DELETE")) {
        const code = wishMatch[1];
        if (req.method === "POST") wished.add(code);
        else wished.delete(code);
        setTimeout(() => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ result: { wished: wished.has(code) } }));
        }, DEMO_API_DELAY_MS);
        return;
      }
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
export default defineConfig(({ mode }) => {
  const buildConfig = mode as BuildConfig;
  return {
    base: "/web-packages",
    build: buildOptionInfo[buildConfig].build,
    experimental: {
      bundledDev: true,
    },
    plugins: [vanillaExtractPlugin(), react(), demoApiPlugin()],
    resolve: {
      tsconfigPaths: true,
    },
  };
});

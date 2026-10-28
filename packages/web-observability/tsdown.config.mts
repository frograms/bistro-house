import { defineConfig, type UserConfig } from "tsdown";

// 서버 코드(OTLP exporter 등)가 브라우저 번들에 섞이지 않도록 진입점을 나눈다.
// 통합 진입점(.)은 index.browser·index.node 를 browser·node 조건으로 고른다
const sharedConfig: UserConfig = {
  entry: {
    browser: "src/browser/index.ts",
    "index.browser": "src/index.browser.ts",
    "index.node": "src/index.node.ts",
    server: "src/server/index.ts",
    "server/http": "src/server/http.ts",
    "server/sentry": "src/server/sentry.ts",
  },
  fixedExtension: true,
  outDir: "dist",
  outExtensions: () => ({ dts: ".d.ts" }),
  platform: "neutral",
  target: "es2020",
  tsconfig: "tsconfig.json",
};

export default defineConfig([
  { ...sharedConfig, clean: true, dts: false, format: "esm" },
  { ...sharedConfig, clean: false, dts: true, format: "cjs" },
]);

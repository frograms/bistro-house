import { defineConfig, type UserConfig } from "tsdown";

// 서버 코드(OTLP exporter 등)가 브라우저 번들에 섞이지 않도록 진입점을 나눈다.
// 앱 코드용 통합 진입점(.)은 index.browser·index.node 를 browser·node 조건으로 고른다. /server 는 서버 배선, /sentry 는 Sentry 병행 연결
const sharedConfig: UserConfig = {
  entry: {
    "index.browser": "src/index.browser.ts",
    "index.node": "src/index.node.ts",
    sentry: "src/sentry.ts",
    server: "src/server/index.ts",
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

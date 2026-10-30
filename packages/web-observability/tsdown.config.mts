import { defineConfig, type UserConfig } from "tsdown";

// 각각 별도 파일로 빌드. 서버 코드가 브라우저 번들에 섞이지 않게 하려고 나눔.
const sharedConfig: UserConfig = {
  entry: {
    "index.browser": "src/browser-index.ts",
    "index.node": "src/node-index.ts",
    sentry: "src/sentry-index.ts",
    server: "src/server-index.ts",
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
  {
    ...sharedConfig,
    clean: false,
    // ESM 전용 패키지라 require 하면 Jest 같은 CJS 로더가 파싱하지 못해 CJS 에만 포함
    deps: { alwaysBundle: [/^@opentelemetry\/browser-instrumentation\//] },
    dts: true,
    format: "cjs",
  },
]);

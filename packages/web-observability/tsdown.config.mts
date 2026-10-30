import { defineConfig, type UserConfig } from "tsdown";

// 각각 별도 파일로 빌드. 서버 코드가 브라우저 번들에 섞이지 않게 하려고 나눔.
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

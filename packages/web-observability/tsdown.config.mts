import { defineConfig, type UserConfig } from "tsdown";

// 각각 별도 파일로 빌드. 서버 코드가 브라우저 번들에 섞이지 않게 하려고 나눔.
const sharedConfig: UserConfig = {
  entry: [
    "src/browser-index.ts",
    "src/node-index.ts",
    "src/sentry-index.ts",
    "src/server-index.ts",
  ],
  fixedExtension: true,
  outDir: "dist",
  outExtensions: () => ({ dts: ".d.ts" }),
  platform: "neutral",
  target: "es2020",
  tsconfig: "tsconfig.json",
};

// neutral 플랫폼은 Node 내장 모듈을 모르므로 외부 모듈로 명시한다(서버 청크만 쓴다)
const NODE_BUILTIN = /^node:/;

export default defineConfig([
  {
    ...sharedConfig,
    clean: true,
    deps: { neverBundle: [NODE_BUILTIN] },
    dts: false,
    format: "esm",
  },
  {
    ...sharedConfig,
    clean: false,
    deps: {
      // ESM 전용 패키지라 require 하면 Jest 같은 CJS 로더가 파싱하지 못해 CJS 에만 포함
      alwaysBundle: [/^@opentelemetry\/browser-instrumentation\//],
      neverBundle: [NODE_BUILTIN],
    },
    dts: true,
    format: "cjs",
  },
]);

import { defineConfig, type UserConfig } from "tsdown";

const sharedConfig: UserConfig = {
  entry: { core: "src/core/index.ts", index: "src/index.ts" },
  fixedExtension: true,
  outDir: "dist",
  platform: "neutral",
  target: "es2020",
  tsconfig: "tsconfig.json",
};

export default defineConfig([
  {
    ...sharedConfig,
    clean: true,
    dts: true,
    format: "esm",
    outExtensions: () => ({ dts: ".d.mts" }),
  },
  {
    ...sharedConfig,
    clean: false,
    dts: true,
    format: "cjs",
    outExtensions: () => ({ dts: ".d.ts" }),
  },
]);

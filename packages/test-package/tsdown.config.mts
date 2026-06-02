import { defineConfig, type UserConfig } from "tsdown";

const sharedConfig: UserConfig = {
  entry: ["src/index.ts"],
  tsconfig: "tsconfig.json",
  outDir: "dist",
  target: "es2020",
  platform: "neutral",
  deps: { skipNodeModulesBundle: true },
  fixedExtension: true,
  outExtensions: () => ({ dts: ".d.ts" }),
};

export default defineConfig([
  { ...sharedConfig, format: "esm", dts: false, clean: true },
  { ...sharedConfig, format: "cjs", dts: true, clean: false },
]);

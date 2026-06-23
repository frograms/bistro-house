import { defineConfig, type UserConfig } from "tsdown";

const sharedConfig: UserConfig = {
  entry: ["src/index.ts"],
  fixedExtension: true,
  outDir: "dist",
  outExtensions: () => ({ dts: ".d.ts" }),
  platform: "node",
  target: "es2020",
  tsconfig: "tsconfig.json",
};

export default defineConfig([
  { ...sharedConfig, clean: true, dts: false, format: "esm" },
  { ...sharedConfig, clean: false, dts: true, format: "cjs" },
]);

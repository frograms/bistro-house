import { defineConfig, type UserConfig } from "tsdown";

const sharedConfig: UserConfig = {
  entry: [
    "src/preset-node-index.ts",
    "src/preset-react-index.ts",
    "src/preset-remix-index.ts",
    "src/preset-vite-index.ts",
    "src/preset-rsbuild-index.ts",
    "src/preset-next-index.ts",
    "src/config-base-index.ts",
    "src/config-typescript-index.ts",
    "src/config-react-index.ts",
    "src/config-remix-index.ts",
    "src/config-vite-index.ts",
    "src/config-rsbuild-index.ts",
    "src/config-next-index.ts",
  ],
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

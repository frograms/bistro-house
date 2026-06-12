import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: false,
  entry: ["src/**/*.ts", "!src/**/*.d.ts"],
  format: "cjs",
  outDir: "dist",
  platform: "node",
  root: "src",
  target: "es2020",
  tsconfig: "tsconfig.json",
  unbundle: true,
});

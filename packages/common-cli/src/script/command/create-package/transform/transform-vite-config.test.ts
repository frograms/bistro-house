import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import { patchViteConfigVanillaExtract } from "./transform-vite-config";

const viteConfigPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../project-resource/package-template/react-vite/vite.config.ts"
);

describe("patchViteConfigVanillaExtract", () => {
  it("plugins 배열에 vanillaExtractPlugin 을 추가한다", () => {
    const source = fs.readFileSync(viteConfigPath, "utf8");
    const patched = patchViteConfigVanillaExtract(source);

    expect(patched).toContain("@vanilla-extract/vite-plugin");
    expect(patched).toContain("vanillaExtractPlugin()");
    expect(patched).toMatch(/react\(\),\s*vanillaExtractPlugin\(\)/);
  });

  it("이미 vanillaExtractPlugin 이 있으면 한 번만 유지한다", () => {
    const source = fs.readFileSync(viteConfigPath, "utf8");
    const patchedOnce = patchViteConfigVanillaExtract(source);
    const patchedTwice = patchViteConfigVanillaExtract(patchedOnce);

    expect(patchedTwice.match(/vanillaExtractPlugin\(\)/g)?.length).toBe(1);
  });
});

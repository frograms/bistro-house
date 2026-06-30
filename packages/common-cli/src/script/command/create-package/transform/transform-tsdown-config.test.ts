import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

import {
  patchSharedConfigCss,
  patchSharedConfigVanillaExtract,
} from "./transform-tsdown-config";

const variantDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../project-resource/package-variant/tsdown-config"
);

const readVariant = (basename: string) =>
  fs.readFileSync(path.join(variantDir, basename), "utf8");

describe("patchSharedConfigCss", () => {
  it("sharedConfig 에 css 블록을 추가한다", () => {
    const source = readVariant("lib.tsdown.config.mts");
    const patched = patchSharedConfigCss(source);

    expect(patched).toContain("css:");
    expect(patched).toContain("minify: true");
    expect(patched).toMatch(/css:\s*\{\s*minify:\s*true/);
  });

  it("lib / react variant 모두 패치 가능하다", () => {
    for (const basename of [
      "lib.tsdown.config.mts",
      "react.tsdown.config.mts",
    ]) {
      const patched = patchSharedConfigCss(readVariant(basename));
      expect(patched).toContain('platform: "');
    }
  });

  it("이미 css 가 있으면 에러 없이 한 번만 유지한다", () => {
    const source = readVariant("lib.tsdown.config.mts");
    const patchedOnce = patchSharedConfigCss(source);
    const patchedTwice = patchSharedConfigCss(patchedOnce);

    expect(patchedTwice.match(/css:/g)?.length).toBe(1);
  });
});

describe("patchSharedConfigVanillaExtract", () => {
  it("sharedConfig 에 vanillaExtractPlugin 을 추가한다", () => {
    const source = readVariant("lib.tsdown.config.mts");
    const patched = patchSharedConfigVanillaExtract(source);

    expect(patched).toContain("@vanilla-extract/rollup-plugin");
    expect(patched).toContain("vanillaExtractPlugin()");
    expect(patched).toMatch(/plugins:\s*\[\s*vanillaExtractPlugin\(\)/);
  });

  it("lib / react variant 모두 패치 가능하다", () => {
    for (const basename of [
      "lib.tsdown.config.mts",
      "react.tsdown.config.mts",
    ]) {
      const patched = patchSharedConfigVanillaExtract(readVariant(basename));
      expect(patched).toContain('platform: "');
      expect(patched).not.toContain("css:");
    }
  });

  it("이미 plugins 가 있으면 에러 없이 한 번만 유지한다", () => {
    const source = readVariant("lib.tsdown.config.mts");
    const patchedOnce = patchSharedConfigVanillaExtract(source);
    const patchedTwice = patchSharedConfigVanillaExtract(patchedOnce);

    expect(patchedTwice.match(/vanillaExtractPlugin\(\)/g)?.length).toBe(1);
  });

  it("기존 plugins 배열에 vanillaExtractPlugin 을 추가한다", () => {
    const source = `
import { defineConfig, type UserConfig } from "tsdown";
import somePlugin from "some-plugin";

const sharedConfig: UserConfig = {
  entry: ["src/index.ts"],
  plugins: [somePlugin()],
};

export default defineConfig([{ ...sharedConfig }]);
`;
    const patched = patchSharedConfigVanillaExtract(source);

    expect(patched).toContain("@vanilla-extract/rollup-plugin");
    expect(patched).toMatch(
      /plugins:\s*\[\s*somePlugin\(\),\s*vanillaExtractPlugin\(\)/
    );
  });
});

#!/usr/bin/env node
/**
 * package.json 의 publishConfig 오버레이 키를 루트 필드에 덮어쓴다 (in-place).
 *
 * Usage: node apply-publish-config-for-publish.mjs <package-folder>
 *
 * - package-folder: packages/ 아래 폴더 이름
 *   예: example-package
 *
 * Lerna-lite / pnpm 이 publish 시 적용하는 매니페스트 키만 루트로 옮긴다.
 * 옮긴 키는 publishConfig 에서 삭제한다. 비면 publishConfig 도 제거한다.
 * registry · access · tag 는 배포 설정이므로 루트로 올리지 않는다.
 *
 * 종료 코드: 0 성공, 1 인자/패키지 실패
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * publishConfig 에서 매니페스트 루트로 옮기는 키.
 * Lerna-lite `publishConfigOverrides` 와 같다.
 */
const PUBLISH_CONFIG_OVERRIDE_KEYS = new Set([
  "bin",
  "browser",
  "cpu",
  "es2015",
  "esnext",
  "exports",
  "imports",
  "libc",
  "main",
  "module",
  "os",
  "type",
  "types",
  "typesVersions",
  "typings",
  "umd:main",
  "unpkg",
]);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "../..");

/**
 * JSON 파일을 읽어 파싱한다.
 */
const loadJson = (path) => {
  return JSON.parse(readFileSync(path, "utf8"));
};

/**
 * packages/<folder>/package.json 경로와 내용을 읽는다.
 * - 폴더 이름만 허용한다. (`/`, `..` 등 경로 입력 거부)
 */
const resolvePackageManifest = (packageFolder) => {
  if (
    !packageFolder ||
    packageFolder.includes("/") ||
    packageFolder.includes("\\") ||
    packageFolder === "." ||
    packageFolder === ".."
  ) {
    throw new Error(
      `packages/ 아래 폴더 이름만 전달하세요. 입력값: ${packageFolder}`
    );
  }

  const manifestPath = join(
    workspaceRoot,
    "packages",
    packageFolder,
    "package.json"
  );
  if (!existsSync(manifestPath)) {
    throw new Error(
      `packages/${packageFolder} 에서 패키지를 찾을 수 없습니다.`
    );
  }

  return { manifestPath, manifest: loadJson(manifestPath) };
};

/**
 * publishConfig 오버레이 키를 루트 필드로 옮긴다.
 * - 변경이 있으면 `true`, 없으면 `false`
 */
const applyPublishConfig = (manifest) => {
  const publishConfig = manifest.publishConfig;
  if (publishConfig == null || typeof publishConfig !== "object") {
    return false;
  }

  let changed = false;

  for (const key of Object.keys(publishConfig)) {
    if (!PUBLISH_CONFIG_OVERRIDE_KEYS.has(key)) {
      continue;
    }

    manifest[key] = structuredClone(publishConfig[key]);
    delete publishConfig[key];
    changed = true;
  }

  if (Object.keys(publishConfig).length === 0) {
    delete manifest.publishConfig;
    changed = true;
  }

  return changed;
};

/**
 * CLI 진입점.
 */
const main = () => {
  const packageFolder = process.argv[2];
  if (!packageFolder) {
    console.error(
      "Usage: node apply-publish-config-for-publish.mjs <package-folder>"
    );
    console.error("  예: example-package");
    process.exit(1);
  }

  const { manifestPath, manifest } = resolvePackageManifest(packageFolder);
  const changed = applyPublishConfig(manifest);

  if (changed) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`✅ publishConfig 오버레이 적용 — ${manifestPath}`);
  } else {
    console.log(`ℹ️  적용할 publishConfig 오버레이 없음 — ${manifestPath}`);
  }
};

try {
  main();
} catch (error) {
  console.error(`❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

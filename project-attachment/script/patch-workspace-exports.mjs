#!/usr/bin/env node
/**
 * packages/<folder> 워크스페이스 exports 를 src 로 두고,
 * 배포용 dist 맵을 publishConfig.exports 에 넣는다 (in-place).
 *
 * Usage: node patch-workspace-exports.mjs <package-folder>
 *
 * - package-folder: packages/ 아래 폴더 이름
 *   예: example-package
 *
 * 동작:
 * - 현재 exports 전체를 publishConfig.exports 로 복사
 * - exports["."] 를 src/index.ts 로 교체
 * - 필요한 키·형태가 없으면 에러로 종료한다
 *
 * 종료 코드: 0 보강 성공, 1 인자/패키지/보강 불가
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WORKSPACE_ENTRY = {
  types: "./src/index.ts",
  default: "./src/index.ts",
};

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "../..");

/**
 * JSON 파일을 읽어 파싱한다.
 */
const loadJson = (path) => {
  return JSON.parse(readFileSync(path, "utf8"));
};

/**
 * packages/<folder> 경로를 만든다.
 * - 폴더 이름만 허용한다. (`/`, `..` 등 경로 입력 거부)
 */
const resolvePackageDir = (packageFolder) => {
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

  const packageDir = join(workspaceRoot, "packages", packageFolder);
  if (!existsSync(join(packageDir, "package.json"))) {
    throw new Error(
      `packages/${packageFolder} 에서 패키지를 찾을 수 없습니다.`
    );
  }

  return packageDir;
};

/**
 * exports 조건 값에서 경로 문자열을 모은다.
 */
const collectExportPaths = (value) => {
  if (typeof value === "string") {
    return [value];
  }
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  return Object.values(value).flatMap((nested) => collectExportPaths(nested));
};

/**
 * exports["."] 를 src 스왑할 수 있는지 검사한다.
 */
const assertCanPatchExports = ({ entry, manifest, manifestPath }) => {
  if (entry == null || typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(
      `exports["."] 가 객체가 아니라 워크스페이스 exports 를 보강할 수 없습니다 — ${manifestPath}`
    );
  }
  if (manifest.publishConfig?.exports != null) {
    throw new Error(
      `publishConfig.exports 가 이미 있어 보강할 수 없습니다 — ${manifestPath}`
    );
  }
  if ("@frograms/development" in entry) {
    throw new Error(
      `@frograms/development 조건이 남아 있어 보강할 수 없습니다 — ${manifestPath}`
    );
  }
  if (collectExportPaths(entry).some((path) => path.startsWith("./src/"))) {
    throw new Error(
      `exports["."] 가 이미 src 를 가리켜 보강할 수 없습니다 — ${manifestPath}`
    );
  }
};

/**
 * package.json exports 를 src / publishConfig.exports 로 나눈다.
 */
const patchExports = (packageDir) => {
  const manifestPath = join(packageDir, "package.json");
  const manifest = loadJson(manifestPath);
  const entry = manifest.exports?.["."];

  assertCanPatchExports({ entry, manifest, manifestPath });

  manifest.publishConfig = {
    ...manifest.publishConfig,
    exports: structuredClone(manifest.exports),
  };
  manifest.exports["."] = WORKSPACE_ENTRY;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`✅ 워크스페이스 exports 보강 완료 — ${manifestPath}`);
};

/**
 * CLI 진입점.
 */
const main = () => {
  const packageFolder = process.argv[2];
  if (!packageFolder) {
    console.error("Usage: node patch-workspace-exports.mjs <package-folder>");
    console.error("  예: example-package");
    process.exit(1);
  }

  patchExports(resolvePackageDir(packageFolder));
};

try {
  main();
} catch (error) {
  console.error(
    `❌ ${error instanceof Error ? error.message : "patch-workspace-exports 실패"}`
  );
  process.exit(1);
}

#!/usr/bin/env node
/**
 * 워크스페이스 exports 에 ./README.md 를 추가한다 (in-place).
 *
 * Usage: node add-workspace-readme-export.mjs <package-folder>
 *
 * - package-folder: packages/ 아래 폴더 이름
 *   예: example-package
 *
 * 동작:
 * - README.md 가 있고 exports["./README.md"] 가 없으면 "./README.md" 로 둔다
 * - publishConfig 는 바꾸지 않는다
 * - README.md 가 없으면 아무 것도 하지 않는다
 *
 * 종료 코드: 0 성공, 1 인자/패키지 실패
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
 * 워크스페이스 exports 에 ./README.md 가 없으면 추가한다.
 */
const addWorkspaceReadmeExport = (packageDir) => {
  const manifestPath = join(packageDir, "package.json");
  const readmePath = join(packageDir, "README.md");
  if (!existsSync(readmePath)) {
    console.log(`ℹ️  README.md 없음 — ${manifestPath}`);
    return;
  }

  const manifest = loadJson(manifestPath);
  if (
    manifest.exports == null ||
    typeof manifest.exports !== "object" ||
    Array.isArray(manifest.exports)
  ) {
    throw new Error(
      `exports 가 객체가 아니라 ./README.md 를 추가할 수 없습니다 — ${manifestPath}`
    );
  }
  if (manifest.exports["./README.md"] != null) {
    console.log(`ℹ️  ./README.md export 가 이미 있음 — ${manifestPath}`);
    return;
  }

  manifest.exports["./README.md"] = "./README.md";
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`✅ 워크스페이스 ./README.md export 추가 — ${manifestPath}`);
};

/**
 * CLI 진입점.
 */
const main = () => {
  const packageFolder = process.argv[2];
  if (!packageFolder) {
    console.error(
      "Usage: node add-workspace-readme-export.mjs <package-folder>"
    );
    console.error("  예: example-package");
    process.exit(1);
  }

  addWorkspaceReadmeExport(resolvePackageDir(packageFolder));
};

try {
  main();
} catch (error) {
  console.error(
    `❌ ${error instanceof Error ? error.message : "add-workspace-readme-export 실패"}`
  );
  process.exit(1);
}

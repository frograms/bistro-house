#!/usr/bin/env node
/**
 * package.json 의 workspace: 의존성을 워크스페이스 실버전으로 치환한다 (in-place).
 *
 * Usage: node rewrite-workspace-deps-for-publish.mjs <package-folder>
 *
 * - package-folder: packages/ 아래 폴더 이름
 *   예: react-a11y
 *
 * 치환 규칙 (pnpm publish / Lerna latest 와 동일):
 * - workspace:*  → <version>
 * - workspace:^  → ^<version>
 * - workspace:~  → ~<version>
 * - workspace:<range> → <range> 에서 protocol 만 제거
 *
 * 종료 코드: 0 성공, 1 인자/패키지/의존성 해석 실패
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DEP_FIELDS = ["dependencies", "optionalDependencies", "peerDependencies"];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(scriptDir, "../..");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function resolvePackageManifest(packageFolder) {
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
}

function buildWorkspaceVersionMap() {
  const packagesDir = join(workspaceRoot, "packages");
  const map = new Map();

  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(packagesDir, entry.name, "package.json");
    try {
      const manifest = loadJson(manifestPath);
      if (manifest.name && manifest.version) {
        map.set(manifest.name, manifest.version);
      }
    } catch {
      // package.json 없는 디렉터리는 무시
    }
  }

  return map;
}

function resolveWorkspaceSpec(spec, depVersion) {
  if (!spec.startsWith("workspace:")) {
    return spec;
  }

  const body = spec.slice("workspace:".length);

  if (body === "*" || body === "") {
    return depVersion;
  }
  if (body === "^" || body === "~") {
    return `${body}${depVersion}`;
  }

  // workspace:^1.2.3 / workspace:>=1.0.0 등 → protocol 제거
  return body;
}

function rewriteManifest(manifest, versionMap) {
  let changed = false;

  for (const field of DEP_FIELDS) {
    const deps = manifest[field];
    if (!deps || typeof deps !== "object") continue;

    for (const [depName, spec] of Object.entries(deps)) {
      if (typeof spec !== "string" || !spec.startsWith("workspace:")) {
        continue;
      }

      const depVersion = versionMap.get(depName);
      if (!depVersion) {
        throw new Error(
          `workspace 의존성 "${depName}" (${spec}) 의 버전을 packages/ 에서 찾을 수 없습니다.`
        );
      }

      const next = resolveWorkspaceSpec(spec, depVersion);
      if (next !== spec) {
        deps[depName] = next;
        changed = true;
      }
    }
  }

  return changed;
}

function main() {
  const packageFolder = process.argv[2];
  if (!packageFolder) {
    console.error(
      "Usage: node rewrite-workspace-deps-for-publish.mjs <package-folder>"
    );
    console.error("  예: react-a11y");
    process.exit(1);
  }

  const { manifestPath, manifest } = resolvePackageManifest(packageFolder);
  const versionMap = buildWorkspaceVersionMap();
  const changed = rewriteManifest(manifest, versionMap);

  if (changed) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`✅ workspace: 의존성 치환 완료 — ${manifestPath}`);
  } else {
    console.log(`ℹ️  치환할 workspace: 의존성 없음 — ${manifestPath}`);
  }
}

try {
  main();
} catch (error) {
  console.error(`❌ ${error instanceof Error ? error.message : error}`);
  process.exit(1);
}

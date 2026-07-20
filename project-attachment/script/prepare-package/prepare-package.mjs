#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(scriptDir, "package-template.json");

const args = process.argv.slice(2);
const packageName = args[0];

if (!packageName) {
  console.error("Usage: node prepare-package.mjs <package-name>");
  console.error("Example: node prepare-package.mjs my-package");
  process.exit(1);
}

const fullPackageName = packageName.startsWith("@watcha-authentic/")
  ? packageName
  : `@watcha-authentic/${packageName}`;

const registry =
  process.env.NPM_CONFIG_REGISTRY || "https://registry.npmjs.org/";
try {
  const user = execSync("npm whoami", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      NPM_CONFIG_REGISTRY: registry,
    },
  }).trim();

  console.log(`ℹ️ npm 사용자: ${user}`);
} catch {
  console.error(
    "❌ @watcha-authentic 스코프 권한이 있는 계정으로 npm login 이 필요 합니다."
  );
  process.exit(1);
}

const tempDir = path.join(scriptDir, "temp-package");
const packageJsonPath = path.join(tempDir, "package.json");

let hasError = false;

try {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

  const packageJson = {
    ...template,
    name: fullPackageName,
    version: "0.0.1",
  };

  delete packageJson.description;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`ℹ️ Creating empty package: ${fullPackageName}`);
  console.log(`Version: ${packageJson.version}`);

  console.log("ℹ️ Publishing to npm registry...");
  process.chdir(tempDir);

  try {
    execSync("npm publish --access public", {
      stdio: "inherit",
      env: {
        ...process.env,
        NPM_CONFIG_REGISTRY:
          process.env.NPM_CONFIG_REGISTRY || "https://registry.npmjs.org/",
      },
    });

    console.log(`✅ Successfully published ${fullPackageName} to npm!`);
  } catch (error) {
    console.error(`❌ Failed to publish ${fullPackageName}`);
    throw error;
  }
} catch (error) {
  hasError = true;
  console.error("Error:", error.message);
} finally {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log("✅ Cleaned up temporary files");
  }
  if (hasError) {
    process.exit(1);
  }
}

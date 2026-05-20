#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// 스크립트 디렉토리 경로
const scriptDir = __dirname;
const templatePath = path.join(scriptDir, "package-template.json");

// 인자 파싱
const args = process.argv.slice(2);
const packageName = args[0];

if (!packageName) {
  console.error("Usage: node prepare-package.js <package-name>");
  console.error("Example: node prepare-package.js my-package");
  process.exit(1);
}

// 패키지 이름이 @watcha-authentic 스코프를 포함하는지 확인
const fullPackageName = packageName.startsWith("@watcha-authentic/")
  ? packageName
  : `@watcha-authentic/${packageName}`;

// npm login 확인
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

// 임시 디렉토리 생성
const tempDir = path.join(scriptDir, "temp-package");
const packageJsonPath = path.join(tempDir, "package.json");

let hasError = false;

try {
  // 기존 임시 디렉토리 정리
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  // 템플릿 읽기
  const template = JSON.parse(fs.readFileSync(templatePath, "utf8"));

  // package.json 생성
  const packageJson = {
    ...template,
    name: fullPackageName,
    version: "0.0.1",
  };

  // description 필드 제거 (나중에 수동으로 추가)
  delete packageJson.description;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`ℹ️ Creating empty package: ${fullPackageName}`);
  console.log(`Version: ${packageJson.version}`);

  // npm publish 실행
  console.log("ℹ️ Publishing to npm registry...");
  process.chdir(tempDir);

  try {
    execSync("npm publish --access public", {
      stdio: "inherit",
      env: {
        ...process.env,
        // npm 레지스트리 설정 확인
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
  // 작업 중 에러가 나면 항상 temp-package 폴더 제거
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log("✅ Cleaned up temporary files");
  }
  // 에러가 발생했으면 종료
  if (hasError) {
    process.exit(1);
  }
}

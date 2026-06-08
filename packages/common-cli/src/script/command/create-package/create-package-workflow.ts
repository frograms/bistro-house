import { spawnSync } from "child_process";
import fs from "fs-extra";
import path from "path";

import { dependencyConfigs } from "../../config/dependency-configs";
import { askQuestion } from "../../util/cli-utils";
import {
  createFolder,
  overwriteFile,
  resolvePath,
} from "../../util/file-utils";
import { setDependenciesToPackageJson } from "../../util/package-utils";
import type {
  CreatePackageContext,
  CreatePackageOptionInfo,
} from "./create-package-context";

const runShellAction = (action: string, cwd: string, label: string) => {
  const parts = action.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  if (!command) {
    throw new Error(`${label} 을 실행할 수 없습니다. command 가 없습니다.`);
  }

  spawnSync(command, args, { cwd, stdio: "inherit" });
};

const buildOverwrites = (
  options: CreatePackageOptionInfo
): Record<string, string> => {
  const overwrites: Record<string, string> = {};

  for (const key of Object.keys(options)) {
    const { init, value } = options[key as keyof CreatePackageOptionInfo];
    if (value === undefined) continue;
    overwrites[init.name] = String(value);
  }

  return overwrites;
};

const applyRegistryPublishConfig = (
  packageJsonPath: string,
  registryAlias?: string,
  registryUrl?: string
) => {
  if (!registryUrl) return;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.publishConfig = {
    [registryAlias || "registry"]: registryUrl,
  };
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
};

export const scaffoldPackage = async (
  context: CreatePackageContext
): Promise<void> => {
  const { configInfo, optionInfo } = context;
  const { executeDir, outputDir, packageType, targetTemplateDir } = configInfo;
  const canPublish = optionInfo.canPublish.value ?? false;
  const eslintConfig = optionInfo.eslintConfig.value;
  const registryAlias = optionInfo.registryAlias.value;
  const registryUrl = optionInfo.registryUrl.value;
  const tsconfig = optionInfo.tsconfig.value;
  const skipInteraction = optionInfo.yes.value ?? false;

  if (!fs.existsSync(targetTemplateDir)) {
    throw new Error(`템플릿을 찾을 수 없습니다: ${targetTemplateDir}`);
  }

  // 제거 또는 덮어쓰기
  if (fs.existsSync(outputDir)) {
    let requestRemove = false;
    if (!skipInteraction) {
      requestRemove =
        (await askQuestion({
          description:
            "해당 경로에 이미 폴더가 존재합니다. 덮어쓰시겠습니까? (y/n)",
          isRequire: true,
          oneOf: ["y", "n"],
          query: "outputDir",
        })) === "y";
    }

    if (requestRemove) fs.removeSync(outputDir);
  }

  // template 복사
  fs.copySync(targetTemplateDir, outputDir);

  // template 별 설정 - gitignore
  if (fs.existsSync(path.join(outputDir, "gitignore"))) {
    fs.renameSync(
      path.join(outputDir, "gitignore"),
      path.join(outputDir, ".gitignore")
    );
  }

  // template 별 설정 - tsconfig
  if (fs.existsSync(path.join(outputDir, "tsconfig.default.json"))) {
    fs.renameSync(
      path.join(outputDir, "tsconfig.default.json"),
      path.join(outputDir, "tsconfig.json")
    );
  }

  fs.rmSync(
    path.join(
      outputDir,
      !canPublish ? "package.publish.json" : "package.default.json"
    )
  );
  fs.renameSync(
    path.join(
      outputDir,
      canPublish ? "package.publish.json" : "package.default.json"
    ),
    path.join(outputDir, "package.json")
  );

  if (tsconfig) {
    fs.copyFileSync(
      resolvePath(tsconfig, executeDir),
      path.join(outputDir, "tsconfig.json")
    );
  }

  // update - eslint-config
  if (eslintConfig) {
    ["eslint.config.mts", "eslint.config.mjs", "eslint.config.js"].forEach(
      (file) => {
        const filePath = path.join(outputDir, file);
        if (fs.existsSync(filePath)) fs.removeSync(filePath);
      }
    );
    const eslintConfigPath = resolvePath(eslintConfig, executeDir);
    fs.copyFileSync(
      eslintConfigPath,
      path.join(outputDir, path.basename(eslintConfigPath))
    );
  }

  // placeholder 업데이트
  const overwrites = buildOverwrites(optionInfo);
  // placeholder 업데이트 - package.json
  overwriteFile(`${outputDir}/package.json`, overwrites);
  // placeholder 업데이트 - LICENSE
  overwriteFile(`${outputDir}/LICENSE`, overwrites);
  // placeholder 업데이트 - README.md
  overwriteFile(`${outputDir}/README.md`, overwrites);

  // package.json
  const packageJsonPath = path.join(outputDir, "package.json");
  // package.json - 레지스트리 설정
  applyRegistryPublishConfig(packageJsonPath, registryAlias, registryUrl);
  // package.json - 의존성 추가
  setDependenciesToPackageJson(packageJsonPath, dependencyConfigs[packageType]);

  // 기본 작업 폴더 생성
  createFolder(path.join(outputDir, "src/script"));
  createFolder(path.join(outputDir, "src/resource"));
  if (packageType !== "lib") {
    createFolder(path.join(outputDir, "src/component"));
  }
};

export const installDependencies = (context: CreatePackageContext) => {
  const { configInfo, optionInfo } = context;
  const { outputDir } = configInfo;
  const packageManager = optionInfo.packageManager.value ?? "pnpm";
  const withoutInstall = optionInfo.withoutInstall.value ?? false;

  if (!withoutInstall) {
    spawnSync(packageManager, ["install"], {
      cwd: outputDir,
      stdio: "inherit",
    });
  }
};

export const runPostActions = (context: CreatePackageContext) => {
  const { configInfo, optionInfo } = context;
  const { executeDir, outputDir } = configInfo;
  const postAction = optionInfo.postAction.value;
  const postTargetAction = optionInfo.postTargetAction.value;

  try {
    if (postTargetAction) {
      console.info("🎬 Post-target-action 실행 중...");
      runShellAction(postTargetAction, outputDir, "Post-target-action");
    }
    if (postAction) {
      console.info("🎬 Post-action 실행 중...");
      runShellAction(postAction, executeDir, "Post-action");
    }
  } catch (error) {
    console.error(error);
  }
};

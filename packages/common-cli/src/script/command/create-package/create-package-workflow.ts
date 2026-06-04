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
import type { CreatePackageContext } from "./create-package-context";

const runShellAction = (action: string, cwd: string, label: string) => {
  const parts = action.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  if (!command) {
    throw new Error(`${label} 을 실행할 수 없습니다. command 가 없습니다.`);
  }

  spawnSync(command, args, { cwd, stdio: "inherit" });
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

export const scaffoldPackage = async (context: CreatePackageContext) => {
  const {
    canPublish,
    configVariables,
    eslintConfig,
    executeDir,
    outputDir,
    packageType,
    registryAlias,
    registryUrl,
    skipInteraction,
    targetTemplateDir,
    tsconfig,
  } = context;

  if (!fs.existsSync(targetTemplateDir)) {
    throw new Error(`템플릿을 찾을 수 없습니다: ${targetTemplateDir}`);
  }

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

  fs.copySync(targetTemplateDir, outputDir);

  if (fs.existsSync(path.join(outputDir, "gitignore"))) {
    fs.renameSync(
      path.join(outputDir, "gitignore"),
      path.join(outputDir, ".gitignore")
    );
  }

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

  overwriteFile(`${outputDir}/package.json`, configVariables);
  if (fs.existsSync(path.join(outputDir, "LICENSE"))) {
    overwriteFile(`${outputDir}/LICENSE`, configVariables);
  }
  overwriteFile(`${outputDir}/README.md`, configVariables);

  const packageJsonPath = path.join(outputDir, "package.json");
  applyRegistryPublishConfig(packageJsonPath, registryAlias, registryUrl);

  createFolder(path.join(outputDir, "src/script"));
  createFolder(path.join(outputDir, "src/resource"));
  if (packageType !== "lib") {
    createFolder(path.join(outputDir, "src/component"));
  }

  setDependenciesToPackageJson(
    packageJsonPath,
    dependencyConfigs[packageType]
  );
};

export const installDependencies = (context: CreatePackageContext) => {
  const { outputDir, packageManager, withoutInstall } = context;

  if (!withoutInstall) {
    spawnSync(packageManager, ["install"], {
      cwd: outputDir,
      stdio: "inherit",
    });
  }
};

export const runPostActions = (context: CreatePackageContext) => {
  const { executeDir, outputDir, postAction, postTargetAction } = context;

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

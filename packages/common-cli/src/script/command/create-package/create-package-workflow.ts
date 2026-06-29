import { spawnSync } from "child_process";
import fs from "fs-extra";
import path from "path";

import {
  buildSystemConfigs,
  toBuildSystemConfigType,
} from "../../config/build-system-config";
import type { PackageLicenseType } from "../../config/package-license-config";
import { styleDependencyConfigInfos } from "../../config/style-dependency-configs";
import { typeDependencyConfigs } from "../../config/type-dependency-configs";
import type {
  PackageStyle,
  ReactViteMode,
} from "../../constant/create-package";
import { askQuestion } from "../../util/cli-utils";
import { runShellAction, toRecord } from "../../util/common-utils";
import {
  createFolder,
  overwritePlaceholdersInDir,
  resolvePath,
} from "../../util/file-utils";
import {
  setPackageJsonAttribute,
  setPackageJsonDependencies,
} from "../../util/package-utils";
import type { CreatePackageContext } from "./create-package-context";
import { applyTransformTsdownConfig } from "./transform/transform-tsdown-config";
import { applyVariantLicense } from "./variant/variant-license";
import { applyVariantPackageJson } from "./variant/variant-package-json";
import { applyVariantReactViteSandbox } from "./variant/variant-react-vite-sandbox";
import { applyVariantStyleType } from "./variant/variant-style-type";
import { applyVariantTsdownConfig } from "./variant/variant-tsdown-config";

export const scaffoldPackage = async (
  context: CreatePackageContext
): Promise<void> => {
  const { configInfo, optionInfo } = context;
  const {
    executeDir,
    outputDir,
    packageType,
    packageVariantRoot,
    targetTemplateDir,
  } = configInfo;
  const canPublish =
    optionInfo.canPublish.value ?? optionInfo.canPublish.init.defaultValue;
  const license: PackageLicenseType =
    (optionInfo.license.value as PackageLicenseType | undefined) ??
    optionInfo.license.init.defaultValue;
  const eslintConfig = optionInfo.eslintConfig.value;
  const registryAlias = optionInfo.registryAlias.value;
  const registryUrl = optionInfo.registryUrl.value;
  const tsconfig = optionInfo.tsconfig.value;
  const skipInteraction =
    optionInfo.yes.value ?? optionInfo.yes.init.defaultValue;
  const reactViteMode: ReactViteMode =
    (optionInfo.reactViteMode.value as ReactViteMode | undefined) ??
    optionInfo.reactViteMode.init.defaultValue;
  const style = optionInfo.style.value as PackageStyle | undefined;

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

  // gitignore 를 .gitignore 로 변경
  if (fs.existsSync(path.join(outputDir, "gitignore"))) {
    fs.renameSync(
      path.join(outputDir, "gitignore"),
      path.join(outputDir, ".gitignore")
    );
  }

  // variant - package.json
  applyVariantPackageJson({
    canPublish,
    outputDir,
    packageVariantRoot,
  });

  // variant - tsdown (lib / react)
  applyVariantTsdownConfig({
    outputDir,
    packageType,
    packageVariantRoot,
  });

  // variant - react-vite
  if (packageType === "react-vite" && reactViteMode === "sandbox") {
    applyVariantReactViteSandbox({ outputDir, packageVariantRoot });
  }

  // variant - style
  if (style !== undefined) {
    applyVariantStyleType({
      outputDir,
      packageType,
      packageVariantRoot,
      style,
    });
  }

  // variant - license
  applyVariantLicense({
    license,
    outputDir,
    packageVariantRoot,
  });

  // transform - tsdown config (style 선택 시 css 블록 주입)
  applyTransformTsdownConfig({ outputDir, packageType, style });

  // override - tsconfig
  if (tsconfig) {
    fs.copyFileSync(
      resolvePath(tsconfig, executeDir),
      path.join(outputDir, "tsconfig.json")
    );
  }

  // override - eslint-config
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
  const overwrites = toRecord(optionInfo);
  overwritePlaceholdersInDir(outputDir, overwrites);

  // package.json
  const packageJsonPath = path.join(outputDir, "package.json");
  // package.json - 레지스트리 설정
  if (registryUrl) {
    setPackageJsonAttribute({
      attribute: {
        publishConfig: {
          [registryAlias || "registry"]: registryUrl,
        },
      },
      path: packageJsonPath,
    });
  }
  // package.json - 의존성 추가
  setPackageJsonDependencies({
    dependencies: [
      ...typeDependencyConfigs[packageType],
      ...(style !== undefined
        ? styleDependencyConfigInfos[packageType][style]
        : []),
    ],
    path: packageJsonPath,
  });
  // package.json - build system 설정
  setPackageJsonAttribute({
    attribute:
      buildSystemConfigs[
        toBuildSystemConfigType(packageType, { reactViteMode })
      ],
    path: packageJsonPath,
  });

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
      runShellAction(postTargetAction, outputDir);
    }
    if (postAction) {
      console.info("🎬 Post-action 실행 중...");
      runShellAction(postAction, executeDir);
    }
  } catch (error) {
    console.error(error);
  }
};

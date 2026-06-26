import { spawnSync } from "child_process";
import fs from "fs-extra";
import path from "path";

import type {
  CreatePackageType,
  PackageStyle,
  ReactViteMode,
  TsdownPackageType,
} from "../../../type/create-package";
import {
  buildSystemConfigs,
  toBuildSystemConfigType,
} from "../../config/build-system-config";
import {
  licenseConfigs,
  type PackageLicenseType,
} from "../../config/package-license-config";
import {
  setPackageJsonAttribute,
  writePackageJsonFile,
} from "../../util/package-utils";
import type { CreatePackageOptionInfo } from "./create-package-context";

export type ApplyPackageJsonVariantOptions = {
  canPublish: boolean;
  outputDir: string;
  packageType: CreatePackageType;
  packageVariantRoot: string;
  reactViteMode: ReactViteMode;
};

export type ApplyLicenseVariantOptions = {
  license: PackageLicenseType;
  outputDir: string;
  packageVariantRoot: string;
};

export const runShellAction = (action: string, cwd: string, label: string) => {
  const parts = action.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  if (!command) {
    throw new Error(`${label} 을 실행할 수 없습니다. command 가 없습니다.`);
  }

  spawnSync(command, args, { cwd, stdio: "inherit" });
};

export const buildOverwrites = (
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

export const applyRegistryPublishConfig = (
  packageJsonPath: string,
  registryAlias?: string,
  registryUrl?: string
) => {
  if (!registryUrl) return;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.publishConfig = {
    [registryAlias || "registry"]: registryUrl,
  };
  writePackageJsonFile({ attribute: packageJson, path: packageJsonPath });
};

export const applyPackageJsonVariant = ({
  canPublish,
  outputDir,
  packageType,
  packageVariantRoot,
  reactViteMode,
}: ApplyPackageJsonVariantOptions) => {
  const packageJsonVariant = canPublish ? "publish.json" : "default.json";
  const packageJsonSource = path.join(
    packageVariantRoot,
    "package-json",
    packageJsonVariant
  );

  if (!fs.existsSync(packageJsonSource)) {
    throw new Error(
      `package.json variant 를 찾을 수 없습니다: ${packageJsonSource}`
    );
  }

  const packageJsonPath = path.join(outputDir, "package.json");
  fs.copyFileSync(packageJsonSource, packageJsonPath);

  setPackageJsonAttribute({
    attribute:
      buildSystemConfigs[
        toBuildSystemConfigType(packageType, { reactViteMode })
      ],
    path: packageJsonPath,
  });
};

export const applyReactViteSandboxVariant = ({
  outputDir,
  packageVariantRoot,
}: {
  outputDir: string;
  packageVariantRoot: string;
}) => {
  const sandboxVariantDir = path.join(
    packageVariantRoot,
    "react-vite",
    "sandbox"
  );

  if (!fs.existsSync(sandboxVariantDir)) {
    throw new Error(
      `react-vite sandbox variant 를 찾을 수 없습니다: ${sandboxVariantDir}`
    );
  }

  fs.copySync(sandboxVariantDir, outputDir, { overwrite: true });
};

const TSDOWN_CONFIG_VARIANT_BASENAMES: Record<TsdownPackageType, string> = {
  lib: "lib.tsdown.config.mts",
  react: "react.tsdown.config.mts",
};

export const applyTsdownConfigVariant = ({
  outputDir,
  packageType,
  packageVariantRoot,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  packageVariantRoot: string;
}) => {
  if (packageType === "react-vite") {
    return;
  }

  const variantBasename = TSDOWN_CONFIG_VARIANT_BASENAMES[packageType];
  const source = path.join(
    packageVariantRoot,
    "tsdown-config",
    variantBasename
  );

  if (!fs.existsSync(source)) {
    throw new Error(`tsdown config variant 를 찾을 수 없습니다: ${source}`);
  }

  fs.copyFileSync(source, path.join(outputDir, "tsdown.config.mts"));
};

export const applyStyleTypeVariant = ({
  outputDir,
  packageType,
  packageVariantRoot,
  style,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  packageVariantRoot: string;
  style: PackageStyle;
}) => {
  /**
   * - react-vite 는 기본적으로 css, scss 타입이 제공 되므로 별도의 variant 작업을 하지 않습니다.
   *   - "types": ["vite/client"] in tsconfig.app.json
   */
  if (packageType === "react-vite") {
    return;
  }

  const styleModulePath = path.join(
    packageVariantRoot,
    "style-type",
    style,
    "style.d.ts"
  );

  if (!fs.existsSync(styleModulePath)) {
    throw new Error(
      `style module declaration 을 찾을 수 없습니다: ${styleModulePath}`
    );
  }

  fs.copyFileSync(styleModulePath, path.join(outputDir, "src/style.d.ts"));
};

export const applyLicenseVariant = ({
  license,
  outputDir,
  packageVariantRoot,
}: ApplyLicenseVariantOptions) => {
  if (license !== "private") {
    const licenseSource = path.join(
      packageVariantRoot,
      "license",
      `${license}.txt`
    );
    if (!fs.existsSync(licenseSource)) {
      throw new Error(`license variant 를 찾을 수 없습니다: ${licenseSource}`);
    }
    fs.copyFileSync(licenseSource, path.join(outputDir, "LICENSE"));
  }

  setPackageJsonAttribute({
    attribute: licenseConfigs[license],
    path: path.join(outputDir, "package.json"),
  });
};

import { spawnSync } from "child_process";
import fs from "fs-extra";

import type { Dependency } from "../../type/dependency";

type DependencyTarget = "--save-peer" | "--save-dev" | "--save-prod";

type InstallPackageSyncArgs = {
  dependencyTargets?: Array<DependencyTarget>;
  packageList: string[];
  packageManager?: "pnpm";
  packageRootPath: string;
};

export const installPackageSync = ({
  dependencyTargets = ["--save-prod"],
  packageList,
  packageManager = "pnpm",
  packageRootPath,
}: InstallPackageSyncArgs) => {
  return spawnSync(
    packageManager,
    ["add", ...packageList, ...dependencyTargets],
    {
      cwd: packageRootPath,
      stdio: "inherit",
    }
  );
};

export const setDependenciesToPackageJson = (
  packageJsonPath: string,
  dependencies: Dependency[]
) => {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  dependencies.forEach((dependency) => {
    // peer 의존성은 dev에도 포함
    if (dependency.targets.includes("--save-peer")) {
      if (!packageJson.peerDependencies) {
        packageJson.peerDependencies = {};
      }
      packageJson.peerDependencies[dependency.name] =
        dependency.peerVersion ?? dependency.version;

      if (
        !dependency.targets.includes("--save-dev") &&
        !packageJson.devDependencies?.[dependency.name]
      ) {
        if (!packageJson.devDependencies) {
          packageJson.devDependencies = {};
        }
        packageJson.devDependencies[dependency.name] = dependency.version;
      }
    }

    // dev 의존성 처리
    if (dependency.targets.includes("--save-dev")) {
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }
      packageJson.devDependencies[dependency.name] = dependency.version;
    }

    // prod 의존성 처리
    if (dependency.targets.includes("--save-prod")) {
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }
      packageJson.dependencies[dependency.name] = dependency.version;
    }
  });

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

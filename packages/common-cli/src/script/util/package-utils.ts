import fs from "fs-extra";

import type { Dependency } from "../../type/dependency";

type WritePackageJsonFileOptions = {
  trailingNewline?: boolean;
};

export const writePackageJsonFile = ({
  attribute,
  path,
  trailingNewline = true,
}: {
  attribute: Record<string, unknown>;
  path: string;
} & WritePackageJsonFileOptions) => {
  const content = JSON.stringify(attribute, null, 2);
  fs.writeFileSync(path, trailingNewline ? `${content}\n` : content);
};

export const setPackageJsonDependencies = ({
  dependencies,
  path,
  trailingNewline,
}: {
  dependencies: Dependency[];
  path: string;
} & WritePackageJsonFileOptions) => {
  const packageJsonAttribute = JSON.parse(fs.readFileSync(path, "utf8"));

  dependencies.forEach((dependency) => {
    // peer 의존성은 dev에도 포함
    if (dependency.targets.includes("--save-peer")) {
      if (!packageJsonAttribute.peerDependencies) {
        packageJsonAttribute.peerDependencies = {};
      }
      packageJsonAttribute.peerDependencies[dependency.name] =
        dependency.peerVersion ?? dependency.version;

      if (
        !dependency.targets.includes("--save-dev") &&
        !packageJsonAttribute.devDependencies?.[dependency.name]
      ) {
        if (!packageJsonAttribute.devDependencies) {
          packageJsonAttribute.devDependencies = {};
        }
        packageJsonAttribute.devDependencies[dependency.name] =
          dependency.version;
      }
    }

    // dev 의존성 처리
    if (dependency.targets.includes("--save-dev")) {
      if (!packageJsonAttribute.devDependencies) {
        packageJsonAttribute.devDependencies = {};
      }
      packageJsonAttribute.devDependencies[dependency.name] =
        dependency.version;
    }

    // prod 의존성 처리
    if (dependency.targets.includes("--save-prod")) {
      if (!packageJsonAttribute.dependencies) {
        packageJsonAttribute.dependencies = {};
      }
      packageJsonAttribute.dependencies[dependency.name] = dependency.version;
    }
  });

  writePackageJsonFile({
    attribute: packageJsonAttribute,
    path,
    trailingNewline,
  });
};

export const setPackageJsonAttribute = ({
  attribute,
  path,
  trailingNewline,
}: {
  attribute: Record<string, unknown>;
  path: string;
} & WritePackageJsonFileOptions) => {
  const packageJsonAttribute = JSON.parse(
    fs.readFileSync(path, "utf8")
  ) as Record<string, unknown>;

  for (const [key, value] of Object.entries(attribute)) {
    packageJsonAttribute[key] = value;
  }

  writePackageJsonFile({
    attribute: packageJsonAttribute,
    path,
    trailingNewline,
  });
};

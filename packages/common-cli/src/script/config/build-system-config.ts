import type { CreatePackageType } from "../../type/create-package";

type PackageJsonFragment = Record<string, unknown>;

const tsdownBuildSystemConfig: PackageJsonFragment = {
  exports: {
    ".": {
      import: "./dist/index.mjs",
      require: "./dist/index.cjs",
      types: "./dist/index.d.ts",
    },
  },
  main: "./dist/index.cjs",
  module: "./dist/index.mjs",
  scripts: {
    build: "rm -rf ./dist && tsdown && pnpm build:post",
    "build:post": "bash ./project-attachment/post-build.sh",
    lint: "eslint .",
    test: "vitest run",
    typecheck: "tsc",
  },
  types: "./dist/index.d.ts",
};

const viteBuildSystemConfig: PackageJsonFragment = {
  exports: {
    ".": {
      import: "./dist/index.js",
      require: "./dist/index.cjs",
      types: "./dist/index.d.ts",
    },
  },
  main: "./dist/index.cjs",
  module: "./dist/index.js",
  scripts: {
    build: "rm -rf ./dist && tsc -b && vite build",
    dev: "vite",
    lint: "eslint .",
    preview: "vite preview",
    test: "vitest run",
    typecheck: "tsc -b",
  },
  type: "module",
  types: "./dist/index.d.ts",
};

export const buildSystemConfigs: Record<
  CreatePackageType,
  PackageJsonFragment
> = {
  lib: tsdownBuildSystemConfig,
  react: tsdownBuildSystemConfig,
  "react-vite": viteBuildSystemConfig,
};

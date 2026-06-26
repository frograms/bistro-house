import type {
  CreatePackageType,
  ReactViteMode,
  TsdownPackageType,
  VitePackageType,
} from "../../type/create-package";

type PackageJsonFragment = Record<string, unknown>;

export type BuildSystemConfigType =
  | "lib"
  | "react"
  | "react-vite-sandbox"
  | "react-vite-library-only";

const BUILD_SYSTEM_CONFIG_TYPE_MAP: Record<
  TsdownPackageType,
  BuildSystemConfigType
> &
  Record<VitePackageType, Record<ReactViteMode, BuildSystemConfigType>> = {
  lib: "lib",
  react: "react",
  "react-vite": {
    "library-only": "react-vite-library-only",
    sandbox: "react-vite-sandbox",
  },
};

export const toBuildSystemConfigType = (
  packageType: CreatePackageType,
  options: { reactViteMode: ReactViteMode }
): BuildSystemConfigType => {
  if (packageType === "react-vite") {
    return BUILD_SYSTEM_CONFIG_TYPE_MAP[packageType][options.reactViteMode];
  } else {
    return BUILD_SYSTEM_CONFIG_TYPE_MAP[packageType];
  }
};

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

const viteLibraryOnlyScripts = {
  build: "rm -rf ./dist && tsc -b && vite build",
  lint: "eslint .",
  test: "vitest run",
  typecheck: "tsc -b",
};

const viteSandboxScripts = {
  ...viteLibraryOnlyScripts,
  dev: "vite",
  preview: "vite preview",
};

const viteBuildSystemBase: PackageJsonFragment = {
  exports: {
    ".": {
      import: "./dist/index.js",
      require: "./dist/index.cjs",
      types: "./dist/index.d.ts",
    },
  },
  main: "./dist/index.cjs",
  module: "./dist/index.js",
  type: "module",
  types: "./dist/index.d.ts",
};

export const buildSystemConfigs: Record<
  BuildSystemConfigType,
  PackageJsonFragment
> = {
  lib: tsdownBuildSystemConfig,
  react: tsdownBuildSystemConfig,
  "react-vite-library-only": {
    ...viteBuildSystemBase,
    scripts: viteLibraryOnlyScripts,
  },
  "react-vite-sandbox": {
    ...viteBuildSystemBase,
    scripts: viteSandboxScripts,
  },
};

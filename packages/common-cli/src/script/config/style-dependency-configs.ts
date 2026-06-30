import type { Dependency } from "../../type/dependency";
import type {
  CreatePackageType,
  PackageStyle,
} from "../constant/create-package";

// tsdown css 의존성
const tsdownCssDependencies: Dependency[] = [
  {
    name: "@tsdown/css",
    targets: ["--save-dev"],
    version: "^0.21.5",
  },
  {
    name: "lightningcss",
    targets: ["--save-dev"],
    version: "^1.32.0",
  },
];

// scss 의존성
const sassEmbeddedDependencies: Dependency[] = [
  {
    name: "sass-embedded",
    targets: ["--save-dev"],
    version: "^1.100.0",
  },
];

// tsdown scss 의존성
const tsdownScssDependencies: Dependency[] = [
  ...tsdownCssDependencies,
  {
    name: "sass-embedded",
    targets: ["--save-dev"],
    version: "^1.100.0",
  },
];

// vanilla-extract 의존성
const vanillaExtractDependencies: Dependency[] = [
  {
    name: "@vanilla-extract/css",
    targets: ["--save-prod"],
    version: "^1.17.4",
  },
];

// vanilla-extract tsdown 의존성
const vanillaExtractTsdownDependencies: Dependency[] = [
  ...vanillaExtractDependencies,
  {
    name: "@vanilla-extract/rollup-plugin",
    targets: ["--save-dev"],
    version: "^1.5.3",
  },
];

// vanilla-extract vite 의존성
const vanillaExtractViteDependencies: Dependency[] = [
  ...vanillaExtractDependencies,
  {
    name: "@vanilla-extract/vite-plugin",
    targets: ["--save-dev"],
    version: "^5.2.3",
  },
];

export const styleDependencyConfigInfos: Record<
  CreatePackageType,
  Record<PackageStyle, Dependency[]>
> = {
  lib: {
    css: tsdownCssDependencies,
    scss: tsdownScssDependencies,
    "vanilla-extract": vanillaExtractTsdownDependencies,
  },
  react: {
    css: tsdownCssDependencies,
    scss: tsdownScssDependencies,
    "vanilla-extract": vanillaExtractTsdownDependencies,
  },
  "react-vite": {
    css: [],
    scss: sassEmbeddedDependencies,
    "vanilla-extract": vanillaExtractViteDependencies,
  },
};

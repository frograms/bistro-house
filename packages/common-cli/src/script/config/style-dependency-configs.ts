import type {
  CreatePackageType,
  PackageStyle,
} from "../../type/create-package";
import type { Dependency } from "../../type/dependency";

export const PACKAGE_STYLE_VALUES = ["css", "scss"] as const;

// tsdown 용 css 의존성
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

export const styleDependencyConfigInfos: Record<
  CreatePackageType,
  Record<PackageStyle, Dependency[]>
> = {
  lib: {
    css: tsdownCssDependencies,
    scss: [...tsdownCssDependencies, ...sassEmbeddedDependencies],
  },
  react: {
    css: tsdownCssDependencies,
    scss: [...tsdownCssDependencies, ...sassEmbeddedDependencies],
  },
  "react-vite": { css: [], scss: sassEmbeddedDependencies },
};

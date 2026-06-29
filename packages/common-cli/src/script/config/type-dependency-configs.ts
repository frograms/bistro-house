import type { Dependency } from "../../type/dependency";
import type { CreatePackageType } from "../constant/create-package";

// 공유 의존성
const sharedDependencies: Dependency[] = [
  {
    name: "@watcha-authentic/eslint-config",
    targets: ["--save-dev"],
    version: "^2.0.1",
  },
  {
    name: "@watcha-authentic/prettier-config",
    targets: ["--save-dev"],
    version: "^1.1.4",
  },
  { name: "prettier", targets: ["--save-dev"], version: "^3.7.4" },
  { name: "typescript", targets: ["--save-dev"], version: "~5.9.3" },
  { name: "vitest", targets: ["--save-dev"], version: "^4.1.8" },
];

// React 의존성
const reactRuntimeDependencies: Dependency[] = [
  {
    name: "@types/react",
    targets: ["--save-dev"],
    version: "^19.0.0",
  },
  {
    name: "@types/react-dom",
    targets: ["--save-dev"],
    version: "^19.0.0",
  },
  {
    name: "react",
    peerVersion: ">=18.0.0",
    targets: ["--save-peer", "--save-dev"],
    version: "^19.0.0",
  },
  {
    name: "react-dom",
    peerVersion: ">=18.0.0",
    targets: ["--save-peer", "--save-dev"],
    version: "^19.0.0",
  },
];

// ESLint 공통 의존성
const eslintCommonDependencies: Dependency[] = [
  {
    name: "eslint",
    targets: ["--save-dev"],
    version: "^9.39.2",
  },
  {
    name: "eslint-plugin-import",
    targets: ["--save-dev"],
    version: "^2.31.0",
  },
  {
    name: "eslint-plugin-perfectionist",
    targets: ["--save-dev"],
    version: "^5.9.0",
  },
  {
    name: "eslint-plugin-simple-import-sort",
    targets: ["--save-dev"],
    version: "^12.1.1",
  },
  {
    name: "eslint-import-resolver-typescript",
    targets: ["--save-dev"],
    version: "^3.6.0",
  },
  { name: "jiti", targets: ["--save-dev"], version: "^2.6.1" },
];

// ESLint TypeScript 용 의존성
const eslintTypescriptDependencies: Dependency[] = [
  {
    name: "@typescript-eslint/parser",
    targets: ["--save-dev"],
    version: "^8.50.0",
  },
  {
    name: "@typescript-eslint/eslint-plugin",
    targets: ["--save-dev"],
    version: "^8.50.0",
  },
];

// ESLint React 용 의존성
const eslintReactDependencies: Dependency[] = [
  {
    name: "eslint-plugin-react",
    targets: ["--save-dev"],
    version: "^7.37.5",
  },
  {
    name: "eslint-plugin-react-hooks",
    targets: ["--save-dev"],
    version: "^7.0.0",
  },
];

// ESLint 타입별 의존성 정보
const eslintDependencyInfo: Record<CreatePackageType, Dependency[]> = {
  lib: [...eslintCommonDependencies, ...eslintTypescriptDependencies],
  react: [
    ...eslintCommonDependencies,
    ...eslintTypescriptDependencies,
    ...eslintReactDependencies,
  ],
  "react-vite": [
    ...eslintCommonDependencies,
    ...eslintTypescriptDependencies,
    ...eslintReactDependencies,
    {
      name: "eslint-plugin-react-refresh",
      targets: ["--save-dev"],
      version: "^0.4.24",
    },
    {
      name: "globals",
      targets: ["--save-dev"],
      version: "^17.6.0",
    },
  ],
};

// 빌드 타입별 의존성 정보
const buildDependencyInfo: Record<"tsdown" | "vite", Dependency[]> = {
  tsdown: [{ name: "tsdown", targets: ["--save-dev"], version: "^0.21.5" }],
  vite: [
    {
      name: "@types/node",
      targets: ["--save-dev"],
      version: "^24",
    },
    {
      name: "@vitejs/plugin-react",
      targets: ["--save-dev"],
      version: "^6.0.1",
    },
    { name: "vite", targets: ["--save-dev"], version: "^8.0.12" },
    {
      name: "vite-plugin-dts",
      targets: ["--save-dev"],
      version: "^4.5.4",
    },
  ],
};

export const typeDependencyConfigs: Record<CreatePackageType, Dependency[]> = {
  lib: [
    ...sharedDependencies,
    ...eslintDependencyInfo.lib,
    ...buildDependencyInfo.tsdown,
  ],
  react: [
    ...sharedDependencies,
    ...eslintDependencyInfo.react,
    ...reactRuntimeDependencies,
    ...buildDependencyInfo.tsdown,
  ],
  "react-vite": [
    ...sharedDependencies,
    ...eslintDependencyInfo["react-vite"],
    ...reactRuntimeDependencies,
    ...buildDependencyInfo.vite,
  ],
};

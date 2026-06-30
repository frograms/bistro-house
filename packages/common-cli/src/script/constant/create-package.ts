import { createStringUnionGuard } from "../util/create-union-guard";

export const CREATE_PACKAGE_TYPE_LIB = "lib" as const;
export const CREATE_PACKAGE_TYPE_REACT = "react" as const;
export const CREATE_PACKAGE_TYPE_REACT_VITE = "react-vite" as const;
export const CREATE_PACKAGE_TYPE_VALUES = [
  CREATE_PACKAGE_TYPE_LIB,
  CREATE_PACKAGE_TYPE_REACT,
  CREATE_PACKAGE_TYPE_REACT_VITE,
] as const;
export type CreatePackageType = (typeof CREATE_PACKAGE_TYPE_VALUES)[number];
export const isCreatePackageType = createStringUnionGuard(
  CREATE_PACKAGE_TYPE_VALUES
);

export const TSDOWN_PACKAGE_TYPE_VALUES = [
  CREATE_PACKAGE_TYPE_LIB,
  CREATE_PACKAGE_TYPE_REACT,
] as const;
export type TsdownPackageType = (typeof TSDOWN_PACKAGE_TYPE_VALUES)[number];
export const isTsdownPackageType = createStringUnionGuard(
  TSDOWN_PACKAGE_TYPE_VALUES
);

export const VITE_PACKAGE_TYPE_VALUES = [
  CREATE_PACKAGE_TYPE_REACT_VITE,
] as const;
export type VitePackageType = (typeof VITE_PACKAGE_TYPE_VALUES)[number];
export const isVitePackageType = createStringUnionGuard(
  VITE_PACKAGE_TYPE_VALUES
);

export const PACKAGE_STYLE_VALUES = [
  "css",
  "scss",
  "vanilla-extract",
] as const;
export type PackageStyle = (typeof PACKAGE_STYLE_VALUES)[number];
export const isPackageStyle = createStringUnionGuard(PACKAGE_STYLE_VALUES);

export const REACT_VITE_MODE_VALUES = ["sandbox", "library-only"] as const;
export type ReactViteMode = (typeof REACT_VITE_MODE_VALUES)[number];
export const isReactViteMode = createStringUnionGuard(REACT_VITE_MODE_VALUES);

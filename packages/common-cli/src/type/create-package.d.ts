export type CreatePackageType = "lib" | "react" | "react-vite";

export type TsdownPackageType = Extract<CreatePackageType, "lib" | "react">;

export type VitePackageType = Extract<CreatePackageType, "react-vite">;

export type PackageStyle = "css" | "scss";

export type ReactViteMode = "sandbox" | "library-only";

import fs from "fs-extra";
import path from "path";

export const applyVariantPackageJson = ({
  canPublish,
  outputDir,
  packageVariantRoot,
}: {
  canPublish: boolean;
  outputDir: string;
  packageVariantRoot: string;
}) => {
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
};

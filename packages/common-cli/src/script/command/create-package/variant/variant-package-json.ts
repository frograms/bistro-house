import fs from "fs-extra";
import path from "path";

/**
 * - canPublish 값에 따라 package.json 배리에이션 파일을 세팅 합니다.
 */
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

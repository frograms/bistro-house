import fs from "fs-extra";
import path from "path";

export const applyVariantReactViteSandbox = ({
  outputDir,
  packageVariantRoot,
}: {
  outputDir: string;
  packageVariantRoot: string;
}) => {
  const sandboxVariantDir = path.join(
    packageVariantRoot,
    "react-vite",
    "sandbox"
  );

  if (!fs.existsSync(sandboxVariantDir)) {
    throw new Error(
      `react-vite sandbox variant 를 찾을 수 없습니다: ${sandboxVariantDir}`
    );
  }

  fs.copySync(sandboxVariantDir, outputDir, { overwrite: true });
};

import fs from "fs-extra";
import path from "path";

import type { CreatePackageType } from "../../../constant/create-package";
import {
  isVitePackageType,
  type ReactViteMode,
} from "../../../constant/create-package";

/**
 * - type: react-vite + reactViteMode: sandbox 에 대한 배리에이션 파일을 세팅 합니다.
 */
export const applyVariantReactViteSandbox = ({
  outputDir,
  packageType,
  packageVariantRoot,
  reactViteMode,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  packageVariantRoot: string;
  reactViteMode: ReactViteMode;
}) => {
  if (!isVitePackageType(packageType) || reactViteMode !== "sandbox") {
    return;
  }

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

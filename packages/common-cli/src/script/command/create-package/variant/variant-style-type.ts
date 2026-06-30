import fs from "fs-extra";
import path from "path";

import {
  type CreatePackageType,
  isVitePackageType,
  type PackageStyle,
} from "../../../constant/create-package";

/**
 * - type: lib, react + style: css, scss 에 대한 타입 배리에이션 파일을 세팅 합니다.
 */
export const applyVariantStyleType = ({
  outputDir,
  packageType,
  packageVariantRoot,
  style,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  packageVariantRoot: string;
  style: PackageStyle;
}) => {
  /**
   * - react-vite 는 기본적으로 css, scss 타입이 제공 되므로 별도의 variant 작업을 하지 않습니다.
   *   - "types": ["vite/client"] in tsconfig.app.json
   */
  if (isVitePackageType(packageType) || style === "vanilla-extract") {
    return;
  }

  const styleModulePath = path.join(
    packageVariantRoot,
    "style-type",
    style,
    "style.d.ts"
  );

  if (!fs.existsSync(styleModulePath)) {
    throw new Error(
      `style module declaration 을 찾을 수 없습니다: ${styleModulePath}`
    );
  }

  fs.copyFileSync(styleModulePath, path.join(outputDir, "src/style.d.ts"));
};

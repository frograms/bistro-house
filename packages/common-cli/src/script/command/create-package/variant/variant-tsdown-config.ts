import fs from "fs-extra";
import path from "path";

import {
  type CreatePackageType,
  isTsdownPackageType,
  type TsdownPackageType,
} from "../../../constant/create-package";

const TSDOWN_CONFIG_VARIANT_BASENAMES: Record<TsdownPackageType, string> = {
  lib: "lib.tsdown.config.mts",
  react: "react.tsdown.config.mts",
};

/**
 * - type: lib, react 에 대한 tsdown config 배리에이션 파일을 세팅 합니다.
 */
export const applyVariantTsdownConfig = ({
  outputDir,
  packageType,
  packageVariantRoot,
}: {
  outputDir: string;
  packageType: CreatePackageType;
  packageVariantRoot: string;
}) => {
  if (!isTsdownPackageType(packageType)) {
    return;
  }

  const variantBasename = TSDOWN_CONFIG_VARIANT_BASENAMES[packageType];
  const source = path.join(
    packageVariantRoot,
    "tsdown-config",
    variantBasename
  );

  if (!fs.existsSync(source)) {
    throw new Error(`tsdown config variant 를 찾을 수 없습니다: ${source}`);
  }

  fs.copyFileSync(source, path.join(outputDir, "tsdown.config.mts"));
};

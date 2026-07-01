import fs from "fs-extra";
import path from "path";

import type { PackageLicenseType } from "../../../config/package-license-config";
import { licenseConfigs } from "../../../config/package-license-config";
import { setPackageJsonAttribute } from "../../../util/package-utils";

/**
 * - license 값에 따라 라이센스 배리에이션 파일을 세팅 합니다.
 */
export const applyVariantLicense = ({
  license,
  outputDir,
  packageVariantRoot,
}: {
  license: PackageLicenseType;
  outputDir: string;
  packageVariantRoot: string;
}) => {
  if (license !== "unlicensed") {
    const licenseSource = path.join(
      packageVariantRoot,
      "license",
      `${license}.txt`
    );
    if (!fs.existsSync(licenseSource)) {
      throw new Error(`license variant 를 찾을 수 없습니다: ${licenseSource}`);
    }
    fs.copyFileSync(licenseSource, path.join(outputDir, "LICENSE"));
  }

  setPackageJsonAttribute({
    attribute: licenseConfigs[license],
    path: path.join(outputDir, "package.json"),
  });
};

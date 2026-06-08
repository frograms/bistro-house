import fs from "fs-extra";
import path from "path";

const VARIANT_WILDCARD = "*";

/** scaffold 후 남길 최종 파일명. 예: `package.json` */
export type VariantTargetFileName = `${string}.${string}`;

/** 템플릿 파일명. variant(`*`)는 런타임 선택. 예: `_VARIANT-*-package.json` */
export type VariantTemplatePattern = `_VARIANT-*-${string}.${string}`;

export type ApplyVariantOptions = {
  onSelectVariant: () => string;
  outputDir: string;
  outputFileName: VariantTargetFileName;
  variantFileName: VariantTemplatePattern;
};

/**
 * 템플릿 variant 파일 중 하나를 선택해 최종 파일명으로 바꿉니다.
 *
 * `variantFileName`: `_VARIANT-{variant}-{name}.{ext}` (`VariantTemplatePattern`)
 * `outputFileName`: scaffold 후 남길 `{name}.{ext}` (`VariantTargetFileName`)
 * 예: `_VARIANT-default-package.json` → `package.json`
 *
 * 1. `onSelectVariant()`로 variant 선택
 * 2. 같은 `outputFileName` 대상 variant 파일 중 선택되지 않은 것 삭제
 * 3. 선택 파일을 `{outputDir}/{outputFileName}`으로 rename
 */
export const applyVariant = ({
  onSelectVariant,
  outputDir,
  outputFileName,
  variantFileName,
}: ApplyVariantOptions) => {
  const wildcardIndex = variantFileName.indexOf(VARIANT_WILDCARD);
  if (wildcardIndex === -1) {
    throw new Error(
      `variantFileName에 '*' 와일드카드가 없습니다: ${variantFileName}`
    );
  }

  const prefix = variantFileName.slice(0, wildcardIndex);
  const suffix = variantFileName.slice(wildcardIndex + VARIANT_WILDCARD.length);

  const variant = onSelectVariant();
  const selectedFileName = `${prefix}${variant}${suffix}`;

  for (const entry of fs.readdirSync(outputDir)) {
    if (entry === selectedFileName) continue;
    if (!entry.startsWith(prefix) || !entry.endsWith(suffix)) continue;

    const variantPart = entry.slice(
      prefix.length,
      entry.length - suffix.length
    );
    if (!variantPart) continue;

    fs.rmSync(path.join(outputDir, entry));
  }

  const selectedPath = path.join(outputDir, selectedFileName);
  if (!fs.existsSync(selectedPath)) {
    throw new Error(
      `대상 variant 파일을 찾을 수 없습니다: ${selectedFileName}`
    );
  }

  fs.renameSync(selectedPath, path.join(outputDir, outputFileName));
};

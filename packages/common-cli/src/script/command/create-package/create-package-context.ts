import path from "path";

import type { CreatePackageType } from "../../../type/create-package";
import type { CustomBuiltOption } from "../../module/option/custom-option";
import type { CustomResolvedOptionInfo } from "../../module/option/custom-option-types";
import type {
  BuiltOptionValue,
  OptionInit,
} from "../../module/option/custom-option-types";
import { readGitConfig } from "../../util/git-utils";
import type { CREATE_PACKAGE_OPTION_INFO } from "./create-package-option-info";

const updateValue = <Init extends OptionInit>(
  option: CustomBuiltOption<Init>,
  value: (prev: BuiltOptionValue<Init>) => BuiltOptionValue<Init>
): CustomBuiltOption<Init> => ({
  ...option,
  value: value(option.value),
});

export type CreatePackageOptionInfo = CustomResolvedOptionInfo<
  typeof CREATE_PACKAGE_OPTION_INFO
>;

export type CreatePackageContext = {
  configInfo: {
    executeDir: string;
    outputDir: string;
    packageRoot: string;
    packageType: CreatePackageType;
    targetTemplateDir: string;
  };
  optionInfo: CreatePackageOptionInfo;
};

export const buildCreatePackageContext = (
  options: CreatePackageOptionInfo
): CreatePackageContext => {
  const authorName = options.authorName.value || readGitConfig("user.name");
  const projectGitUrl = options.projectGitUrl.value;
  const projectOrganization = options.projectOrganization.value;

  const optionInfo: CreatePackageOptionInfo = {
    ...options,
    authorEmail: updateValue(
      options.authorEmail,
      (prev) => prev || readGitConfig("user.email")
    ),
    authorName: updateValue(options.authorName, () =>
      projectOrganization ? `@${projectOrganization}#${authorName}` : authorName
    ),
    licenseHolder: updateValue(
      options.licenseHolder,
      (prev) => prev || authorName
    ),
    packageName: updateValue(
      options.packageName,
      (prev) =>
        prev ||
        (projectOrganization
          ? `@${projectOrganization}/${options.projectName.value}`
          : options.projectName.value)
    ),
    projectHomepage: updateValue(
      options.projectHomepage,
      (prev) => prev || (projectGitUrl ? `${projectGitUrl}#readme` : undefined)
    ),
  };

  const packageType = optionInfo.type.value as CreatePackageType;
  const executeDir = process.env.INIT_CWD || process.cwd();
  const packageRoot = path.join(__dirname, "../../../..");
  const targetTemplateDir = path.join(
    packageRoot,
    "project-resource/package-template",
    packageType
  );
  const destDir = optionInfo.destDir.value;
  const outputDir = path.join(
    destDir ? path.join(executeDir, destDir) : executeDir,
    optionInfo.projectName.value
  );

  return {
    configInfo: {
      executeDir,
      outputDir,
      packageRoot,
      packageType,
      targetTemplateDir,
    },
    optionInfo,
  };
};

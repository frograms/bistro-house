#!/usr/bin/env node

import { CustomCommand } from "../../module/command/custom-command";
import { validateOptionInfo } from "../../module/option/custom-option-validate";
import { buildCreatePackageContext } from "./create-package-context";
import { CREATE_PACKAGE_OPTION_INFO } from "./create-package-option-info";
import {
  formatGeneratedPackage,
  installDependencies,
  runPostActions,
  scaffoldPackage,
} from "./create-package-workflow";

export const createPackageCommand = new CustomCommand(
  "create-package",
  CREATE_PACKAGE_OPTION_INFO
)
  .description("Javascript 기반 패키지를 생성합니다.")
  .action(async (options) => {
    const context = buildCreatePackageContext(options);
    validateOptionInfo(CREATE_PACKAGE_OPTION_INFO, context.optionInfo);
    await scaffoldPackage(context);
    installDependencies(context);
    runPostActions(context);
    formatGeneratedPackage(context);
    console.info(`✅ ${context.configInfo.outputDir} 에 생성 되었습니다.`);
  });

#!/usr/bin/env node

import { Command } from "commander";

import { buildCreatePackageContext } from "./create-package-context";
import {
  type CreatePackageRawOptions,
  resolveCreatePackageInput,
} from "./create-package-input";
import { CREATE_PACKAGE_OPTION_DEFINITIONS } from "./create-package-options";
import {
  installDependencies,
  runPostActions,
  scaffoldPackage,
} from "./create-package-workflow";

export const createPackageCommand = new Command("create-package")
  .storeOptionsAsProperties(false)
  .description("Javascript 기반 패키지를 생성합니다.")
  .addOptions(CREATE_PACKAGE_OPTION_DEFINITIONS)
  .action(async (rawOptions: CreatePackageRawOptions) => {
    const input = await resolveCreatePackageInput(rawOptions);
    const context = buildCreatePackageContext(input);

    await scaffoldPackage(context);
    installDependencies(context);
    runPostActions(context);
    console.info(`✅ ${context.outputDir} 에 생성 되었습니다.`);
  });

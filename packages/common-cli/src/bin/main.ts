#!/usr/bin/env node

import { Command } from "commander";
import path from "path";

import { createPackageCommand } from "../script/command/create-package/create-package";
import { loadJsonFromFile } from "../script/util/file-utils";

const packageJSON = loadJsonFromFile<{ name: string; version: string }>(
  path.join(__dirname, "../../package.json")
);

const mainCommand = new Command(`${packageJSON.name}`)
  .description("Common CLI")
  .version(packageJSON.version)
  .addCommand(createPackageCommand);

mainCommand.parse(process.argv);

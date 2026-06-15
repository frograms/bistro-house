import { baseConfigs } from "@watcha-authentic/eslint-config/configs/base";
import { typescriptConfigs } from "@watcha-authentic/eslint-config/configs/typescript";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  {
    ignores: ["project-attachment/**/*"],
  },
];

export default config;

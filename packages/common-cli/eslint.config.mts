import { baseConfigs } from "@watcha-authentic/eslint-config/configs/base";
import { typescriptConfigs } from "@watcha-authentic/eslint-config/configs/typescript";
import type { Linter } from "eslint";

const config: Array<Linter.Config> = [
  ...baseConfigs,
  ...typescriptConfigs,
  {
    ignores: ["project-resource/package-template/**"],
  },
];

export default config;

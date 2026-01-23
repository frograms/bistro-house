import { baseConfigs, typescriptConfigs } from "@watcha-authentic/eslint-config";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  {
    ignores: ["project-attachment/**/*"],
  },
];

export default config;

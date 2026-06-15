import { baseConfigs } from "@watcha-authentic/eslint-config/configs/base";
import { typescriptConfigs } from "@watcha-authentic/eslint-config/configs/typescript";

const eslintConfig = [
  ...baseConfigs,
  ...typescriptConfigs,
  {
    ignores: ["project-resource/package-template/**"],
  },
];

export default eslintConfig;

import { baseConfigs } from "@watcha-authentic/eslint-config/configs/base";
import { typescriptConfigs } from "@watcha-authentic/eslint-config/configs/typescript";

const eslintConfig = [...baseConfigs, ...typescriptConfigs];

export default eslintConfig;

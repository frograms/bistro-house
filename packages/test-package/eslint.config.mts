import lint from "@watcha-authentic/eslint-config";

const eslintConfig = [...lint.baseConfigs, ...lint.typescriptConfigs];

export default eslintConfig;

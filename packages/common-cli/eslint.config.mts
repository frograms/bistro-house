import lint from "@watcha-authentic/eslint-config";

const eslintConfig = [
  ...lint.baseConfigs,
  ...lint.typescriptConfigs,
  {
    ignores: ["project-resource/package-template/**"],
  },
];

export default eslintConfig;

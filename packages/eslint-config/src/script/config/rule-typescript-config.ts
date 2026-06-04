import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import type { Linter } from "eslint";
import { resolve } from "path";

// tsconfig.json 경로 (사용하는 프로젝트의 루트 기준)
const project = resolve(process.cwd(), "tsconfig.json");

// typescript-eslint flat config 추천 설정
const recommendedConfigs = Array.isArray(
  tsEslintPlugin.configs["flat/recommended"]
)
  ? tsEslintPlugin.configs["flat/recommended"]
  : [tsEslintPlugin.configs["flat/recommended"]];

export const typescriptConfigs: Linter.Config[] = [
  ...recommendedConfigs,
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          // ignoreRestSiblings: true, // 구조 분해 할당 시 나머지 연산자 사용을 허용하여 경고 무시
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
      "no-unused-vars": "off",
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
  },
  {
    // .d.ts 파일에 대한 unused 변수 규칙 비활성화
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
    },
  },
];

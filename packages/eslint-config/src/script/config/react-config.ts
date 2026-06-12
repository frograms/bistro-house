import type { Linter } from "eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export const reactConfigs: Linter.Config[] = [
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        JSX: "readonly",
        React: "readonly",
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: "module",
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": {
        rules: reactHooksPlugin.rules,
      },
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react/display-name": "off",
      "react/function-component-definition": [
        "warn",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/jsx-boolean-value": "warn",
      "react/jsx-curly-brace-presence": "warn",
      "react/jsx-fragments": "warn",
      "react/jsx-key": "warn",
      "react/jsx-no-duplicate-props": [
        "warn",
        {
          ignoreCase: true,
        },
      ],
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-sort-props": [
        "warn",
        {
          callbacksLast: true,
          reservedFirst: true,
          shorthandLast: true,
        },
      ],
      "react/no-invalid-html-attribute": "warn",
      "react/no-unknown-property": [
        "warn",
        {
          ignore: ["sx"],
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/self-closing-comp": "warn",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];

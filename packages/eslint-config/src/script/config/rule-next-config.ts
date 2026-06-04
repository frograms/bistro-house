import nextPlugin from "@next/eslint-plugin-next";
import type { Linter } from "eslint";

export const nextConfigs: Linter.Config[] = [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        JSX: "readonly",
        React: "readonly",
      },
    },
    plugins: {
      "@next/next": {
        rules: nextPlugin.rules,
      },
    },
    rules: {
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
    },
  },
];

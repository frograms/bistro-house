import type { Linter } from "eslint";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export const viteConfigs: Linter.Config[] = [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        import: "readonly",
        importMeta: "readonly",
      },
    },
    plugins: {
      "react-refresh": reactRefreshPlugin,
    },
    rules: {
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
    },
  },
];

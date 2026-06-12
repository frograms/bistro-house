import type { Linter } from "eslint";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import globals from "globals";

export const rsbuildConfigs: Linter.Config[] = [
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
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

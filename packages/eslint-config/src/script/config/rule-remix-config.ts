import type { Linter } from "eslint";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export const remixConfigs: Linter.Config[] = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      // Remix globals
      globals: {
        action: "readonly",
        context: "readonly",
        headers: "readonly",
        loader: "readonly",
        params: "readonly",
        request: "readonly",
      },
    },
    plugins: {
      "react-refresh": reactRefreshPlugin,
    },
    rules: {
      // Remix specific rules
      "import/no-duplicates": "error",
      "react-refresh/only-export-components": [
        "error",
        { allowConstantExport: true },
      ],
    },
  },
];

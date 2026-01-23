import type { Linter } from "eslint";
import reactRefreshPlugin from "eslint-plugin-react-refresh";

export const remixConfigs: Linter.Config[] = [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        // Remix globals
        loader: "readonly",
        action: "readonly",
        headers: "readonly",
        params: "readonly",
        request: "readonly",
        context: "readonly",
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
      // Remix specific rules
      "import/no-duplicates": "error",
    },
  },
];

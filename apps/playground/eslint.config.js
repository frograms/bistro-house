import { vitePreset } from "@watcha-authentic/eslint-config/vite";

import workspaceImportFixer from "./project-attachment/eslint-rule/workspace-import-fixer.js";

const config = [
  ...vitePreset,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "workspace-import-fixer": workspaceImportFixer,
    },
    rules: {
      "workspace-import-fixer/use-direct-path": "error",
    },
  },
];

export default config;

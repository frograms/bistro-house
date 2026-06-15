import { vitePreset } from "@watcha-authentic/eslint-config/vite";

import workspaceImportFixer from "./project-attachment/eslint-rule/workspace-import-fixer.js";

const config = [
  ...vitePreset,
  {
    plugins: {
      "workspace-import-fixer": workspaceImportFixer,
    },
    rules: {
      // workspace 패키지 임포트 자동 수정 (에러 표시 + 저장 시 자동 fix)
      "workspace-import-fixer/use-direct-path": "error",
    },
  },
];

export default config;

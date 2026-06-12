import type { Linter } from "eslint";

import { nodePreset } from "./src/preset-node-index";

const eslintConfig: Linter.Config[] = [...nodePreset];

export default eslintConfig;

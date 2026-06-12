import type { Linter } from "eslint";

import { nodePreset } from "./src/preset-node-index";

const config: Linter.Config[] = [...nodePreset];

export default config;

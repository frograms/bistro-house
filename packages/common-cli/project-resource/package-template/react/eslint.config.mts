import { reactPreset } from "@watcha-authentic/eslint-config/react";
import type { Linter } from "eslint";

const config: Array<Linter.Config> = [...reactPreset];

export default config;

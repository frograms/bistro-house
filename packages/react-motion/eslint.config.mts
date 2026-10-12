import { vitePreset } from "@watcha-authentic/eslint-config/vite";
import type { Linter } from "eslint";

const config: Array<Linter.Config> = [...vitePreset];

export default config;

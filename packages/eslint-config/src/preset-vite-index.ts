import type { Linter } from "eslint";

import { baseConfigs } from "./script/config/base-config";
import { reactConfigs } from "./script/config/react-config";
import { typescriptConfigs } from "./script/config/typescript-config";
import { viteConfigs } from "./script/config/vite-config";

/**
 * - vite preset
 * - base + typescript + react + vite
 */
export const vitePreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
  ...viteConfigs,
];

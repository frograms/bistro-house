import type { Linter } from "eslint";

import { baseConfigs } from "./script/config/base-config";
import { reactConfigs } from "./script/config/react-config";
import { typescriptConfigs } from "./script/config/typescript-config";

/**
 * - react preset
 * - base + typescript + react
 */
export const reactPreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
];

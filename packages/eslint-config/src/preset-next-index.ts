import type { Linter } from "eslint";

import { baseConfigs } from "./script/config/base-config";
import { nextConfigs } from "./script/config/next-config";
import { reactConfigs } from "./script/config/react-config";
import { typescriptConfigs } from "./script/config/typescript-config";

/**
 * - next preset
 * - base + typescript + react + next
 */
export const nextPreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
  ...nextConfigs,
];

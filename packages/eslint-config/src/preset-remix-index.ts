import type { Linter } from "eslint";

import { baseConfigs } from "./script/config/base-config";
import { reactConfigs } from "./script/config/react-config";
import { remixConfigs } from "./script/config/remix-config";
import { typescriptConfigs } from "./script/config/typescript-config";

/**
 * - remix preset
 * - base + typescript + react + remix
 */
export const remixPreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
  ...remixConfigs,
];

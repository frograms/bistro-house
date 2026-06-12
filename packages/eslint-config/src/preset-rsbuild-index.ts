import type { Linter } from "eslint";

import { baseConfigs } from "./script/config/base-config";
import { reactConfigs } from "./script/config/react-config";
import { rsbuildConfigs } from "./script/config/rsbuild-config";
import { typescriptConfigs } from "./script/config/typescript-config";

/**
 * - rsbuild preset
 * - base + typescript + react + rsbuild
 */
export const rsbuildPreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
  ...rsbuildConfigs,
];

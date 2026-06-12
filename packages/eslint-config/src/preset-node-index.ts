import type { Linter } from "eslint";

import { baseConfigs } from "./script/config/base-config";
import { typescriptConfigs } from "./script/config/typescript-config";

/**
 * - node preset
 * - base + typescript
 */
export const nodePreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
];

import type { Linter } from "eslint";

import { baseConfigs } from "./rule-base-config";
import { nextConfigs } from "./rule-next-config";
import { reactConfigs } from "./rule-react-config";
import { remixConfigs } from "./rule-remix-config";
import { rsbuildConfigs } from "./rule-rsbuild-config";
import { typescriptConfigs } from "./rule-typescript-config";
import { viteConfigs } from "./rule-vite-config";

/**
 * - react preset
 * - base + typescript + react
 */
export const reactPreset: Linter.Config[] = [
  ...baseConfigs,
  ...typescriptConfigs,
  ...reactConfigs,
];

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

import type { StyleRule } from "@vanilla-extract/css";

export const BREAKPOINTS = {
  mobile: "(max-width: 720px)",
  tablet: "(max-width: 980px)",
} as const;

type BreakpointName = keyof typeof BREAKPOINTS;

const atMedia =
  (name: BreakpointName) =>
  (rules: StyleRule): { "@media": Record<string, StyleRule> } => ({
    "@media": {
      [BREAKPOINTS[name]]: rules,
    },
  });

/** `style({ ...mediaQuery.mobile({ display: "none" }) })` */
export const mediaQuery = {
  mobile: atMedia("mobile"),
  tablet: atMedia("tablet"),
};

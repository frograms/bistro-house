import { style } from "@vanilla-extract/css";

export const commonCodeBlockCss = {
  wrap: style({
    background: "#111827",
    borderRadius: 14,
    color: "#f9fafb",
    fontSize: 13,
    lineHeight: 1.7,
    margin: 0,
    overflowX: "auto",
    padding: 16,
    whiteSpace: "pre",
  }),
};

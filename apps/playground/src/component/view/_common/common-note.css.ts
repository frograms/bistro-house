import { style } from "@vanilla-extract/css";

export const commonNoteCss = {
  group: style({
    display: "grid",
    gap: 8,
  }),
  wrap: style({
    background: "#f8fafc",
    border: "1px solid #dbeafe",
    borderRadius: 14,
    color: "#334155",
    fontSize: 14,
    lineHeight: 1.65,
    margin: 0,
    overflowWrap: "break-word",
    padding: "14px 16px",
    wordBreak: "keep-all",
  }),
};

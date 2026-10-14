import { style } from "@vanilla-extract/css";

export const reactThemeContextPickThemeCss = {
  card: style({
    background: "#ffffff",
    border: "2px solid #ff8ab2",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgb(255 5 88 / 0.08)",
    boxSizing: "border-box",
    padding: 16,
    width: "min(100%, 420px)",
  }),
  stage: style({
    alignItems: "center",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 36,
    width: "100%",
  }),
  stageGuide: style({
    color: "#9f1239",
    fontSize: 14,
    fontWeight: 700,
    margin: 0,
    textAlign: "center",
  }),
  swatch: style({
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    minHeight: 160,
    padding: "28px 24px",
  }),
  swatchLabel: style({
    fontSize: 13,
    fontWeight: 700,
    margin: 0,
    opacity: 0.72,
  }),
  swatchValue: style({
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
    margin: "6px 0 0",
  }),
};

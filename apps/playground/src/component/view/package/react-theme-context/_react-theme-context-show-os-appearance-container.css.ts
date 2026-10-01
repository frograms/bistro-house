import { style } from "@vanilla-extract/css";

export const reactThemeContextShowOsAppearanceCss = {
  card: style({
    background: "#ffffff",
    border: "2px solid #ff8ab2",
    borderRadius: 18,
    boxShadow: "0 8px 24px rgb(255 5 88 / 0.08)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minHeight: 120,
    padding: "28px 24px",
    width: "min(100%, 420px)",
  }),
  label: style({
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 700,
    margin: 0,
  }),
  stage: style({
    alignItems: "center",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 36,
    width: "100%",
  }),
  value: style({
    color: "#111827",
    fontSize: 32,
    fontWeight: 800,
    lineHeight: 1.2,
    margin: 0,
  }),
};

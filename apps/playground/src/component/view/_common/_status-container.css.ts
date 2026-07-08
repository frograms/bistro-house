import { globalStyle, style } from "@vanilla-extract/css";

export const statusContainerCss = {
  character: style({
    alignItems: "center",
    background:
      "linear-gradient(135deg, rgb(255 5 88 / 0.1), rgb(17 24 39 / 0.05))",
    border: "1px solid rgb(255 5 88 / 0.18)",
    borderRadius: 28,
    color: "#ff0558",
    display: "inline-flex",
    fontSize: 40,
    fontWeight: 900,
    height: 96,
    justifyContent: "center",
    letterSpacing: "-0.08em",
    marginBottom: 8,
    width: 96,
  }),
  wrap: style({
    alignContent: "center",
    display: "grid",
    gap: 12,
    justifyItems: "center",
    minHeight: "100vh",
    padding: "48px 24px",
    textAlign: "center",
  }),
};

globalStyle(`${statusContainerCss.wrap} h2`, {
  fontSize: 32,
  lineHeight: 1.2,
  margin: 0,
});

globalStyle(`${statusContainerCss.wrap} p`, {
  color: "#4b5563",
  fontSize: 16,
  lineHeight: 1.7,
  margin: 0,
  maxWidth: 420,
});

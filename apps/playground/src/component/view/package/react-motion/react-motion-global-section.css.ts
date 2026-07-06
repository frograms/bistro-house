import { style } from "@vanilla-extract/css";

export const reactMotionGlobalSectionCss = {
  dragBox: style({
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #ff8ab2",
    borderRadius: 24,
    boxShadow: "0 18px 40px rgb(15 23 42 / 0.18)",
    color: "#c90045",
    display: "flex",
    fontWeight: 800,
    height: 112,
    justifyContent: "center",
    left: "calc(50% - 56px)",
    position: "absolute",
    top: "calc(50% - 56px)",
    userSelect: "none",
    width: 112,
    zIndex: 1,
  }),
  stage: style({
    background:
      "linear-gradient(135deg, rgb(255 5 88 / 0.1), transparent 28rem), #fff1f5",
    border: "1px dashed #ff8ab2",
    borderRadius: 24,
    height: 360,
    overflow: "hidden",
    position: "relative",
  }),
  stageGuide: style({
    color: "#9f1239",
    fontSize: 14,
    fontWeight: 700,
    left: 20,
    position: "absolute",
    top: 18,
  }),
};

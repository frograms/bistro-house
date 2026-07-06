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
    height: 360,
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

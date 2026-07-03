import { style } from "@vanilla-extract/css";

export const reactMotionPointerSectionCss = {
  dragBox: style({
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #ff8ab2",
    borderRadius: 24,
    boxShadow: "0 16px 35px rgb(15 23 42 / 0.15)",
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
};

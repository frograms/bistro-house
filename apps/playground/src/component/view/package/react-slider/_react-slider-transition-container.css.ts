import { style } from "@vanilla-extract/css";

export const reactSliderTransitionContainerCss = {
  transitionCard: style({
    opacity: "var(--slider-card-opacity, 1)",
    transform: "scale(var(--slider-card-scale, 1))",
    transitionDuration: "var(--slider-transition-duration, 500ms)",
    transitionProperty: "opacity, transform",
  }),
  transitionDim: style({
    background: "rgb(0 0 0 / 0.6)",
    inset: 0,
    opacity: "var(--slider-dim-opacity, 0)",
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "var(--slider-transition-duration, 500ms)",
    transitionProperty: "opacity",
    zIndex: 2,
  }),
};

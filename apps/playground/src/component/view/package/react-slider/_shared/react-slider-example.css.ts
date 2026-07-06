import { globalStyle, style } from "@vanilla-extract/css";

export const reactSliderExampleCss = {
  card: style({
    background:
      "radial-gradient(circle at 18% 18%, rgb(255 255 255 / 0.28), transparent 22%), radial-gradient(circle at 86% 78%, rgb(255 255 255 / 0.18), transparent 26%), var(--slider-card-gradient)",
    borderRadius: 22,
    color: "#ffffff",
    minHeight: 360,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  }),
  cardContent: style({
    alignContent: "end",
    display: "grid",
    gap: 14,
    inset: 0,
    padding: 32,
    position: "absolute",
    zIndex: 1,
  }),
  cardWithShadow: style({
    boxShadow: "0 22px 55px rgb(15 23 42 / 0.18)",
  }),
  exampleBlock: style({
    display: "grid",
    gap: 16,
  }),
  stage: style({
    containerType: "inline-size",
    padding: 36,
  }),
};

globalStyle(`${reactSliderExampleCss.card}::after`, {
  background:
    "linear-gradient(135deg, transparent 0 42%, rgb(255 255 255 / 0.14) 42% 43%, transparent 43% 100%)",
  content: '""',
  inset: 0,
  position: "absolute",
});

globalStyle(`${reactSliderExampleCss.cardContent} span`, {
  background: "rgb(255 255 255 / 0.16)",
  border: "1px solid rgb(255 255 255 / 0.2)",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
  justifySelf: "start",
  letterSpacing: "0.08em",
  padding: "6px 10px",
  textTransform: "uppercase",
});

globalStyle(`${reactSliderExampleCss.cardContent} h3`, {
  fontSize: "clamp(44px, 8cqw, 84px)",
  letterSpacing: "-0.06em",
  lineHeight: 0.95,
  margin: 0,
});

globalStyle(`${reactSliderExampleCss.cardContent} p`, {
  color: "rgb(255 255 255 / 0.78)",
  fontSize: 16,
  lineHeight: 1.6,
  margin: 0,
  maxWidth: 420,
});

import { globalStyle, style } from "@vanilla-extract/css";

export const commonExamplePanelsCss = {
  stagePanel: style({
    background:
      "linear-gradient(135deg, rgb(255 5 88 / 0.1), transparent 28rem), #fff1f5",
    border: "1px dashed #ff8ab2",
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  }),
  statePanel: style({
    background: "#fafafa",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    margin: 0,
    padding: 16,
  }),
  statePanelTitle: style({
    alignItems: "flex-start",
    flexDirection: "column",
    gridColumn: "1 / -1",
  }),
};

globalStyle(
  `${commonExamplePanelsCss.statePanel} div:not(${commonExamplePanelsCss.statePanelTitle})`,
  {
    alignItems: "flex-start",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    display: "grid",
    gap: 6,
    padding: "12px 14px",
  }
);

globalStyle(`${commonExamplePanelsCss.statePanelTitle}`, {
  alignItems: "flex-start",
  display: "flex",
  gap: 8,
});

globalStyle(`${commonExamplePanelsCss.statePanel} dt`, {
  color: "#6b7280",
  fontSize: 13,
});

globalStyle(`${commonExamplePanelsCss.statePanel} dd`, {
  color: "#111827",
  fontWeight: 700,
  margin: 0,
});

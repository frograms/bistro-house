import { globalStyle, style } from "@vanilla-extract/css";

export const commonExampleControlsCss = {
  checkboxField: style({
    cursor: "pointer",
  }),
  controlGroup: style({
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    gridColumn: "1 / -1",
    paddingBottom: 14,
  }),
  controlPanel: style({
    background: "#fafafa",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    color: "#111827",
    display: "grid",
    gap: 14,
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    margin: 0,
    padding: 16,
  }),
  controlPanelTitle: style({
    fontWeight: 800,
    gridColumn: "1 / -1",
    margin: 0,
  }),
};

globalStyle(`${commonExampleControlsCss.controlPanel} label`, {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  lineHeight: 1.5,
});

globalStyle(`${commonExampleControlsCss.controlPanel} span`, {
  color: "#6b7280",
  fontSize: 13,
  fontWeight: 600,
});

globalStyle(`${commonExampleControlsCss.controlPanel} select`, {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  color: "#111827",
  font: "inherit",
  fontSize: 14,
  fontWeight: 700,
  padding: "6px 28px 6px 10px",
});

globalStyle(`${commonExampleControlsCss.controlPanel} button`, {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 999,
  color: "#111827",
  cursor: "pointer",
  font: "inherit",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.4,
  padding: "7px 13px",
});

globalStyle(`${commonExampleControlsCss.controlPanel} button:hover`, {
  borderColor: "#ff8ab2",
  color: "#ff0558",
});

globalStyle(`${commonExampleControlsCss.controlPanel} input`, {
  font: "inherit",
  fontSize: 14,
});

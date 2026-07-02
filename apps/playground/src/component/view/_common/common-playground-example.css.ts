import { globalStyle, style } from "@vanilla-extract/css";

export const commonPlaygroundExampleCss = {
  apiReference: style({
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    display: "grid",
    gap: 18,
    padding: 22,
  }),
  apiTable: style({
    borderCollapse: "collapse",
    minWidth: 860,
    width: "100%",
  }),
  apiTableScroll: style({
    overflowX: "auto",
    width: "100%",
  }),
  buttonGroup: style({
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  }),
  checkboxField: style({
    cursor: "pointer",
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
  exampleLabel: style({
    color: "#ff0558",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase",
  }),
  exampleSection: style({
    display: "grid",
    gap: 20,
  }),
  packagePlayground: style({
    display: "grid",
    gap: 20,
  }),
  readmeBody: style({
    display: "grid",
    gap: 16,
    minWidth: 0,
  }),
  readmeCodeBlock: style({
    background: "#111827",
    borderRadius: 14,
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
  }),
  readmeDocument: style({
    "@media": {
      "(max-width: 720px)": {
        borderRadius: 14,
        padding: 18,
      },
    },
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    display: "grid",
    gap: 20,
    minWidth: 0,
    padding: 22,
  }),
  readmeHeader: style({
    borderBottom: "1px solid #e5e7eb",
    display: "grid",
    gap: 6,
    paddingBottom: 16,
  }),
  referenceGroup: style({
    display: "grid",
    gap: 10,
  }),
  referenceHeader: style({
    display: "grid",
    gap: 6,
    margin: 0,
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

globalStyle(`${commonPlaygroundExampleCss.apiReference} h2`, {
  fontSize: 24,
  margin: 0,
});

globalStyle(`${commonPlaygroundExampleCss.apiReference} h3`, {
  fontSize: 16,
  margin: 0,
});

globalStyle(`${commonPlaygroundExampleCss.referenceHeader} p`, {
  color: "#4b5563",
  lineHeight: 1.6,
  margin: 0,
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} h1`, {
  fontSize: 28,
  lineHeight: 1.2,
  margin: 0,
  overflowWrap: "break-word",
  scrollMarginTop: 24,
  wordBreak: "keep-all",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} > *`, {
  minWidth: 0,
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} h2`, {
  borderTop: "1px solid #e5e7eb",
  fontSize: 22,
  lineHeight: 1.3,
  margin: "16px 0 0",
  overflowWrap: "break-word",
  paddingTop: 24,
  scrollMarginTop: 24,
  wordBreak: "keep-all",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} h3`, {
  fontSize: 17,
  lineHeight: 1.4,
  margin: "8px 0 0",
  overflowWrap: "break-word",
  scrollMarginTop: 24,
  wordBreak: "keep-all",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} p`, {
  color: "#3f3f46",
  lineHeight: 1.7,
  margin: 0,
  overflowWrap: "break-word",
  wordBreak: "keep-all",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} a`, {
  color: "#c90045",
  fontWeight: 700,
  overflowWrap: "break-word",
  textDecoration: "none",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} a:hover`, {
  color: "#ff0558",
  textDecoration: "underline",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} ul, ${commonPlaygroundExampleCss.readmeBody} ol`, {
  color: "#3f3f46",
  lineHeight: 1.7,
  margin: 0,
  minWidth: 0,
  paddingLeft: 20,
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} li`, {
  overflowWrap: "break-word",
  wordBreak: "keep-all",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} li + li`, {
  marginTop: 4,
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} pre`, {
  background: "transparent",
  boxSizing: "border-box",
  color: "#f9fafb",
  margin: 0,
  maxWidth: "100%",
  overflowX: "auto",
  overscrollBehaviorX: "contain",
  padding: "44px 16px 16px",
  WebkitOverflowScrolling: "touch",
});

globalStyle(`${commonPlaygroundExampleCss.readmeCodeBlock} button`, {
  background: "rgb(255 255 255 / 0.08)",
  border: "1px solid rgb(255 255 255 / 0.16)",
  borderRadius: 999,
  color: "#f9fafb",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
  padding: "5px 10px",
  position: "absolute",
  right: 10,
  top: 10,
  zIndex: 1,
});

globalStyle(`${commonPlaygroundExampleCss.readmeCodeBlock} button:hover`, {
  background: "rgb(255 255 255 / 0.14)",
});

globalStyle(`${commonPlaygroundExampleCss.readmeCodeBlock} button[data-copied='true']`, {
  background: "rgb(34 197 94 / 0.18)",
  borderColor: "rgb(74 222 128 / 0.5)",
  color: "#bbf7d0",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} code`, {
  background: "#f4f4f5",
  borderRadius: 6,
  color: "#18181b",
  fontSize: 13,
  overflowWrap: "anywhere",
  padding: "2px 6px",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} pre code`, {
  background: "transparent",
  boxSizing: "border-box",
  color: "inherit",
  display: "inline-block",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  lineHeight: 1.7,
  minWidth: "100%",
  padding: "0 16px 0 0",
  whiteSpace: "pre",
});

globalStyle(`${commonPlaygroundExampleCss.readmeBody} img`, {
  maxWidth: "100%",
});

globalStyle(`${commonPlaygroundExampleCss.apiTable} th`, {
  color: "#6b7280",
  fontSize: 13,
  fontWeight: 700,
  padding: "10px 12px",
  textAlign: "left",
});

globalStyle(`${commonPlaygroundExampleCss.apiTable} td`, {
  borderTop: "1px solid #e5e7eb",
  color: "#3f3f46",
  lineHeight: 1.55,
  padding: "12px",
  verticalAlign: "top",
});

globalStyle(`${commonPlaygroundExampleCss.apiTable} code`, {
  background: "#f4f4f5",
  borderRadius: 6,
  color: "#18181b",
  fontSize: 13,
  padding: "2px 6px",
  whiteSpace: "nowrap",
});

globalStyle(`${commonPlaygroundExampleCss.controlPanel} label`, {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  lineHeight: 1.5,
});

globalStyle(`${commonPlaygroundExampleCss.controlPanel} span`, {
  color: "#6b7280",
  fontSize: 13,
  fontWeight: 600,
});

globalStyle(`${commonPlaygroundExampleCss.controlPanel} select`, {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  color: "#111827",
  font: "inherit",
  fontSize: 14,
  fontWeight: 700,
  padding: "6px 28px 6px 10px",
});

globalStyle(`${commonPlaygroundExampleCss.controlPanel} button`, {
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

globalStyle(`${commonPlaygroundExampleCss.controlPanel} button:hover`, {
  borderColor: "#ff8ab2",
  color: "#ff0558",
});

globalStyle(`${commonPlaygroundExampleCss.controlPanel} input`, {
  font: "inherit",
  fontSize: 14,
});

globalStyle(`${commonPlaygroundExampleCss.controlPanel} ${commonPlaygroundExampleCss.buttonGroup}`, {
  borderBottom: "1px solid #e5e7eb",
  gridColumn: "1 / -1",
  paddingBottom: 14,
});

globalStyle(
  `${commonPlaygroundExampleCss.statePanel} div:not(${commonPlaygroundExampleCss.statePanelTitle})`,
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

globalStyle(`${commonPlaygroundExampleCss.statePanelTitle}`, {
  alignItems: "flex-start",
  display: "flex",
  gap: 8,
});

globalStyle(`${commonPlaygroundExampleCss.statePanel} dt`, {
  color: "#6b7280",
  fontSize: 13,
});

globalStyle(`${commonPlaygroundExampleCss.statePanel} dd`, {
  color: "#111827",
  fontWeight: 700,
  margin: 0,
});

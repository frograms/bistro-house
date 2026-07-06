import { globalStyle, style } from "@vanilla-extract/css";

export const commonReadmeCss = {
  body: style({
    display: "grid",
    gap: 16,
    minWidth: 0,
  }),
  codeBlock: style({
    background: "#111827",
    borderRadius: 14,
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
  }),
  document: style({
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
};

globalStyle(`${commonReadmeCss.body} h1`, {
  fontSize: 28,
  lineHeight: 1.2,
  margin: 0,
  overflowWrap: "break-word",
  scrollMarginTop: 24,
  wordBreak: "keep-all",
});

globalStyle(`${commonReadmeCss.body} > *`, {
  minWidth: 0,
});

globalStyle(`${commonReadmeCss.body} h2`, {
  borderTop: "1px solid #e5e7eb",
  fontSize: 22,
  lineHeight: 1.3,
  margin: "16px 0 0",
  overflowWrap: "break-word",
  paddingTop: 24,
  scrollMarginTop: 24,
  wordBreak: "keep-all",
});

globalStyle(`${commonReadmeCss.body} h3`, {
  fontSize: 17,
  lineHeight: 1.4,
  margin: "8px 0 0",
  overflowWrap: "break-word",
  scrollMarginTop: 24,
  wordBreak: "keep-all",
});

globalStyle(`${commonReadmeCss.body} p`, {
  color: "#3f3f46",
  lineHeight: 1.7,
  margin: 0,
  overflowWrap: "break-word",
  wordBreak: "keep-all",
});

globalStyle(`${commonReadmeCss.body} a`, {
  color: "#c90045",
  fontWeight: 700,
  overflowWrap: "break-word",
  textDecoration: "none",
});

globalStyle(`${commonReadmeCss.body} a:hover`, {
  color: "#ff0558",
  textDecoration: "underline",
});

globalStyle(`${commonReadmeCss.body} ul, ${commonReadmeCss.body} ol`, {
  color: "#3f3f46",
  lineHeight: 1.7,
  margin: 0,
  minWidth: 0,
  paddingLeft: 20,
});

globalStyle(`${commonReadmeCss.body} li`, {
  overflowWrap: "break-word",
  wordBreak: "keep-all",
});

globalStyle(`${commonReadmeCss.body} li + li`, {
  marginTop: 4,
});

globalStyle(`${commonReadmeCss.body} pre`, {
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

globalStyle(`${commonReadmeCss.codeBlock} button`, {
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

globalStyle(`${commonReadmeCss.codeBlock} button:hover`, {
  background: "rgb(255 255 255 / 0.14)",
});

globalStyle(`${commonReadmeCss.codeBlock} button[data-copied='true']`, {
  background: "rgb(34 197 94 / 0.18)",
  borderColor: "rgb(74 222 128 / 0.5)",
  color: "#bbf7d0",
});

globalStyle(`${commonReadmeCss.body} code`, {
  background: "#f4f4f5",
  borderRadius: 6,
  color: "#18181b",
  fontSize: 13,
  overflowWrap: "anywhere",
  padding: "2px 6px",
});

globalStyle(`${commonReadmeCss.body} pre code`, {
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

globalStyle(`${commonReadmeCss.body} img`, {
  maxWidth: "100%",
});

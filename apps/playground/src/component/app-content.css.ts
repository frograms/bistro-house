import { globalStyle, style } from "@vanilla-extract/css";

export const appContentCss = {
  content: style({
    minWidth: 0,
  }),
  contentLayout: style({
    "@media": {
      "(max-width: 720px)": {
        paddingTop: 28,
        width: "min(100% - 32px, 1120px)",
      },
    },
    margin: "0 auto",
    padding: "64px 0 80px",
    width: "min(1120px, calc(100% - 48px))",
  }),
  contentLayoutWithToc: style({
    "@media": {
      "(max-width: 980px)": {
        gridTemplateColumns: "1fr",
      },
    },
    alignItems: "start",
    display: "grid",
    gap: 32,
    gridTemplateColumns: "minmax(0, 1fr) 184px",
  }),
  description: style({
    color: "#4b5563",
    fontSize: 18,
    lineHeight: 1.7,
    maxWidth: 720,
  }),
  eyebrow: style({
    "@media": {
      "(max-width: 720px)": {
        display: "none",
      },
    },
    color: "#ff0558",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.08em",
    margin: 0,
    textTransform: "uppercase",
  }),
  header: style({
    display: "grid",
    gap: 16,
    marginBottom: 32,
  }),
  pageMeta: style({
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  }),
  pageMetaLink: style({
    alignItems: "center",
    background: "#111827",
    border: "1px solid transparent",
    borderRadius: 999,
    boxShadow: "0 10px 24px rgb(17 24 39 / 0.14)",
    color: "#ffffff",
    display: "inline-flex",
    fontSize: 14,
    fontWeight: 800,
    gap: 6,
    padding: "8px 14px",
    textDecoration: "none",
    transition:
      "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, color 120ms ease, transform 120ms ease",
  }),
  pageToc: style({
    "@media": {
      "(max-width: 980px)": {
        display: "none",
      },
    },
    borderLeft: "1px solid #e5e7eb",
    paddingLeft: 16,
    position: "sticky",
    top: 24,
  }),
  shell: style({
    "@media": {
      "(max-width: 720px)": {
        gridTemplateColumns: "1fr",
      },
    },
    display: "grid",
    gridTemplateColumns: "296px minmax(0, 1fr)",
    minHeight: "100vh",
  }),
};

globalStyle(`${appContentCss.content} h1`, {
  fontSize: "clamp(40px, 5vw, 56px)",
  lineHeight: 1.05,
  marginBottom: 0,
  overflowWrap: "break-word",
  wordBreak: "keep-all",
});

globalStyle(
  `${appContentCss.content} h1, ${appContentCss.content} h2, ${appContentCss.content} h3, ${appContentCss.content} p`,
  {
    marginTop: 0,
  }
);

globalStyle(`${appContentCss.content} [data-playground-toc]`, {
  scrollMarginTop: 24,
});

globalStyle(`${appContentCss.pageMetaLink}:hover`, {
  background: "#18181b",
  borderColor: "transparent",
  boxShadow: "0 12px 28px rgb(255 5 88 / 0.2)",
  color: "#ffffff",
  transform: "translateY(-1px)",
});

globalStyle(`${appContentCss.pageMetaLink} svg`, {
  display: "block",
  flexShrink: 0,
});

globalStyle(`${appContentCss.pageToc} ol`, {
  display: "grid",
  gap: 8,
  listStyle: "none",
  margin: 0,
  padding: 0,
});

globalStyle(`${appContentCss.pageToc} li[data-depth='2']`, {
  paddingLeft: 12,
});

globalStyle(`${appContentCss.pageToc} li[data-depth='3']`, {
  paddingLeft: 24,
});

globalStyle(`${appContentCss.pageToc} li[data-depth='4']`, {
  paddingLeft: 36,
});

globalStyle(`${appContentCss.pageToc} a`, {
  color: "#6b7280",
  display: "block",
  fontSize: 13,
  lineHeight: 1.4,
  textDecoration: "none",
});

globalStyle(`${appContentCss.pageToc} a:hover`, {
  color: "#ff0558",
});

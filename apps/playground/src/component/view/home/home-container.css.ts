import { globalStyle, style } from "@vanilla-extract/css";

export const homeContainerCss = {
  exampleGrid: style({
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  }),
  exampleLink: style({
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    color: "#111827",
    display: "grid",
    gap: 8,
    padding: 18,
    textDecoration: "none",
    transition:
      "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
  }),
  intro: style({
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    display: "grid",
    gap: 16,
    padding: 24,
  }),
  section: style({
    display: "grid",
    gap: 20,
  }),
};

globalStyle(`${homeContainerCss.intro} h2`, {
  fontSize: 32,
  margin: 0,
});

globalStyle(`${homeContainerCss.intro} p`, {
  color: "#4b5563",
  lineHeight: 1.7,
  margin: 0,
});

globalStyle(`${homeContainerCss.exampleLink}:hover`, {
  background: "#f8fafc",
  borderColor: "#ff8ab2",
  boxShadow: "0 8px 18px rgb(15 23 42 / 0.08)",
  transform: "translateY(-1px)",
});

globalStyle(`${homeContainerCss.exampleLink} strong`, {
  fontSize: 18,
});

globalStyle(`${homeContainerCss.exampleLink} small`, {
  color: "#ff0558",
  fontWeight: 800,
});

globalStyle(`${homeContainerCss.exampleLink} span`, {
  color: "#6b7280",
  lineHeight: 1.5,
});

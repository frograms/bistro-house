import { globalStyle, style } from "@vanilla-extract/css";

export const homeContainerCss = {
  emptyPackageCard: style({
    alignItems: "center",
    background:
      "linear-gradient(135deg, rgb(255 5 88 / 0.08), rgb(17 24 39 / 0.04))",
    border: "1px solid rgb(255 5 88 / 0.16)",
    borderRadius: 18,
    color: "#111827",
    display: "grid",
    gap: 8,
    justifyItems: "center",
    minHeight: 168,
    padding: 24,
    textAlign: "center",
  }),
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
  npmOrgLink: style({
    alignItems: "center",
    background:
      "linear-gradient(135deg, rgb(255 5 88 / 0.08), rgb(17 24 39 / 0.04))",
    border: "1px solid rgb(255 5 88 / 0.18)",
    borderRadius: 16,
    color: "#111827",
    display: "flex",
    gap: 14,
    justifyContent: "space-between",
    padding: "16px 18px",
    textDecoration: "none",
    transition:
      "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease",
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

globalStyle(`${homeContainerCss.npmOrgLink}:hover`, {
  borderColor: "#ff8ab2",
  transform: "translateY(-1px)",
});

globalStyle(`${homeContainerCss.npmOrgLink} strong`, {
  fontSize: 16,
  lineHeight: 1.4,
});

globalStyle(`${homeContainerCss.npmOrgLink} > span:last-child`, {
  alignItems: "center",
  background: "#111827",
  borderRadius: 999,
  color: "#ffffff",
  display: "inline-flex",
  flexShrink: 0,
  fontSize: 14,
  fontWeight: 800,
  height: 30,
  justifyContent: "center",
  width: 30,
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

globalStyle(`${homeContainerCss.emptyPackageCard} > div`, {
  alignItems: "center",
  background: "#ffffff",
  border: "1px solid rgb(255 5 88 / 0.18)",
  borderRadius: 20,
  color: "#ff0558",
  display: "inline-flex",
  fontSize: 28,
  fontWeight: 900,
  height: 60,
  justifyContent: "center",
  letterSpacing: "-0.08em",
  width: 60,
});

globalStyle(`${homeContainerCss.emptyPackageCard} strong`, {
  fontSize: 18,
  lineHeight: 1.4,
});

globalStyle(`${homeContainerCss.emptyPackageCard} p`, {
  color: "#6b7280",
  lineHeight: 1.5,
  margin: 0,
});

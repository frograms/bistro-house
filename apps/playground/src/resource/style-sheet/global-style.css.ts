import { globalStyle } from "@vanilla-extract/css";

globalStyle("#root", {
  minHeight: "100vh",
});

globalStyle("*, *::before, *::after", {
  boxSizing: "border-box",
});

globalStyle("html", {
  scrollBehavior: "smooth",
  scrollPaddingTop: 96,
});

globalStyle("body", {
  background: "#ffffff",
  color: "#111827",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
});

globalStyle("button, select", {
  font: "inherit",
});

globalStyle("button", {
  background: "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 999,
  color: "#111827",
  cursor: "pointer",
  padding: "8px 14px",
});

globalStyle("button:hover", {
  borderColor: "#9ca3af",
});

globalStyle(
  "button:focus-visible, select:focus-visible, a:focus-visible, input:focus-visible",
  {
    outline: "3px solid rgb(255 5 88 / 0.28)",
    outlineOffset: 3,
  }
);

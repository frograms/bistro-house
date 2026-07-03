import { globalStyle, style } from "@vanilla-extract/css";

export const commonSidebarCss = {
  backdrop: style({
    "@media": {
      "(max-width: 720px)": {
        appearance: "none",
        background: "rgb(15 23 42 / 0.22)",
        border: 0,
        borderRadius: 0,
        bottom: 0,
        cursor: "pointer",
        display: "block",
        left: 0,
        opacity: 0,
        padding: 0,
        pointerEvents: "none",
        position: "fixed",
        right: 0,
        top: 0,
        transition: "opacity 160ms ease",
        zIndex: 35,
      },
    },
    display: "none",
  }),
  brandIcon: style({
    "@media": {
      "(max-width: 720px)": {
        borderRadius: 8,
        height: 28,
        width: 28,
      },
    },
    borderRadius: 10,
    display: "block",
    height: 32,
    width: 32,
  }),
  brandLink: style({
    alignItems: "center",
    color: "#111827",
    display: "flex",
    gap: 10,
    textDecoration: "none",
  }),
  brandText: style({
    "@media": {
      "(max-width: 720px)": {
        fontSize: 16,
      },
    },
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: "-0.04em",
  }),
  header: style({
    "@media": {
      "(max-width: 720px)": {
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
      },
    },
    display: "grid",
    gap: 8,
  }),
  menu: style({
    "@media": {
      "(max-width: 720px)": {
        borderLeft: "1px solid #e5e7eb",
        display: "grid",
        gap: 1,
        paddingLeft: 12,
      },
    },
    borderLeft: "1px solid #e5e7eb",
    display: "grid",
    gap: 1,
    paddingLeft: 12,
  }),
  menuButton: style({
    "@media": {
      "(max-width: 720px)": {
        alignItems: "center",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 999,
        color: "#111827",
        cursor: "pointer",
        display: "inline-flex",
        fontSize: 13,
        fontWeight: 800,
        gap: 8,
        padding: "8px 12px",
      },
    },
    display: "none",
  }),
  navScrollArea: style({
    "@media": {
      "(max-width: 720px)": {
        alignContent: "start",
        display: "grid",
        gap: 24,
        height: "100%",
        overflowY: "auto",
        overscrollBehavior: "contain",
        padding: "84px 24px 28px",
        WebkitOverflowScrolling: "touch",
      },
    },
    display: "grid",
    gap: 28,
  }),
  section: style({
    "@media": {
      "(max-width: 720px)": {
        gap: 8,
      },
    },
    display: "grid",
    gap: 8,
  }),
  sectionHeader: style({
    paddingLeft: 1,
  }),
  sectionHeaderLink: style({
    color: "#111827",
    display: "inline-block",
    textDecoration: "none",
    transition: "color 160ms ease",
  }),
  wrap: style({
    "@media": {
      "(max-width: 720px)": {
        borderBottom: "1px solid #e5e7eb",
        borderRight: 0,
        boxShadow: "0 8px 24px rgb(15 23 42 / 0.06)",
        gap: 0,
        height: "auto",
        maxWidth: "100vw",
        overflow: "visible",
        padding: "14px 16px",
        position: "sticky",
        zIndex: 30,
      },
    },
    alignSelf: "start",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    height: "100dvh",
    overflowY: "auto",
    padding: "28px 24px",
    position: "sticky",
    top: 0,
  }),
};

globalStyle(`${commonSidebarCss.wrap} nav`, {
  "@media": {
    "(max-width: 720px)": {
      background: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      bottom: 0,
      left: 0,
      maxWidth: "min(84vw, 340px)",
      minHeight: "100dvh",
      overflow: "hidden",
      position: "fixed",
      top: 0,
      transform: "translateX(-100%)",
      width: "100%",
      zIndex: 40,
    },
  },
});

globalStyle(`${commonSidebarCss.wrap} nav[data-state='open']`, {
  "@media": {
    "(max-width: 720px)": {
      transform: "translateX(0)",
      transition: "transform 180ms ease",
    },
  },
});

globalStyle(`${commonSidebarCss.backdrop}[data-state='open']`, {
  "@media": {
    "(max-width: 720px)": {
      opacity: 1,
      pointerEvents: "auto",
    },
  },
});

globalStyle(`${commonSidebarCss.sectionHeader} a`, {
  "@media": {
    "(max-width: 720px)": {
      color: "#111827",
      fontSize: 14,
      letterSpacing: 0,
    },
  },
  color: "#111827",
  fontSize: 14,
  fontWeight: 800,
  margin: 0,
});

globalStyle(
  `${commonSidebarCss.sectionHeader} a:hover, ${commonSidebarCss.sectionHeader} a[aria-current='page']`,
  {
    color: "#ff0558",
  }
);

globalStyle(`${commonSidebarCss.menu} a`, {
  "@media": {
    "(max-width: 720px)": {
      background: "transparent",
      border: 0,
      borderLeft: "1px solid transparent",
      borderRadius: 0,
      marginLeft: 0,
      padding: "8px 10px 8px 13px",
      whiteSpace: "normal",
    },
  },
  borderLeft: "1px solid transparent",
  borderRadius: 0,
  color: "#52525b",
  display: "block",
  marginLeft: -13,
  padding: "6px 10px 6px 13px",
  textAlign: "left",
  textDecoration: "none",
  transition:
    "background-color 160ms ease, border-color 160ms ease, color 160ms ease",
});

globalStyle(
  `${commonSidebarCss.menu} a:hover, ${commonSidebarCss.menu} a[aria-current='page']`,
  {
    color: "#18181b",
  }
);

globalStyle(`${commonSidebarCss.menu} a[aria-current='page']`, {
  "@media": {
    "(max-width: 720px)": {
      background: "transparent",
      borderLeftColor: "#ff0558",
      boxShadow: "none",
    },
  },
  background: "transparent",
  borderLeftColor: "#ff0558",
  color: "#ff0558",
});

globalStyle(`${commonSidebarCss.menu} a > span`, {
  fontSize: 14,
  fontWeight: 600,
});

globalStyle(`${commonSidebarCss.menu} a[aria-current='page'] > span`, {
  fontWeight: 800,
});

globalStyle(`${commonSidebarCss.menuButton} span`, {
  background:
    "linear-gradient(#111827, #111827) 0 0 / 14px 2px no-repeat, linear-gradient(#111827, #111827) 0 5px / 14px 2px no-repeat, linear-gradient(#111827, #111827) 0 10px / 14px 2px no-repeat",
  display: "block",
  height: 12,
  width: 14,
});

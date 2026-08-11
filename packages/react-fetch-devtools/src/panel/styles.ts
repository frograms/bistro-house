import type { CSSProperties } from "react";

export const palette = {
  bg: "#141b1c",
  line: "#2c393b",
  muted: "#8fa1a3",
  orange: "#e8935c",
  orangeSoft: "rgba(232, 147, 92, 0.14)",
  raised: "#232e30",
  teal: "#52c5cf",
  tealBright: "#8fdbe2",
  tealSoft: "rgba(82, 197, 207, 0.12)",
  text: "#e8eded",
} as const;

const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Segoe UI", sans-serif';

const monoFontFamily = 'ui-monospace, "SF Mono", Menlo, monospace';

/** 런처 버튼, 패널 닫힘 상태, 고스트 라벨이 공유하는 크기 */
export const LAUNCHER_SIZE = 44;
export const PANEL_OFFSET = 16;
export const PANEL_RADIUS = 12;

export const PANEL_WIDTH = "min(360px, calc(100vw - 32px))";
export const PANEL_HEIGHT = "min(240px, calc(100vh - 32px))";
export const PANEL_EXPANDED_WIDTH = "min(560px, calc(100vw - 32px))";
export const PANEL_EXPANDED_HEIGHT = "min(340px, calc(100vh - 32px))";

const launcherFaceStyle: CSSProperties = {
  alignItems: "center",
  color: palette.teal,
  display: "flex",
  fontSize: 11,
  fontWeight: 700,
  height: LAUNCHER_SIZE,
  justifyContent: "center",
  width: LAUNCHER_SIZE,
};

export const launcherButtonStyle: CSSProperties = {
  ...launcherFaceStyle,
  background: palette.bg,
  border: `1px solid ${palette.teal}`,
  borderRadius: 999,
  bottom: PANEL_OFFSET,
  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.35)",
  cursor: "pointer",
  fontFamily,
  lineHeight: 1,
  padding: 0,
  position: "fixed",
  right: PANEL_OFFSET,
};

export const panelGhostLabelStyle: CSSProperties = {
  ...launcherFaceStyle,
  bottom: 0,
  pointerEvents: "none",
  position: "absolute",
  right: 0,
};

export const panelStyle: CSSProperties = {
  background: palette.bg,
  bottom: PANEL_OFFSET,
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.45)",
  color: palette.text,
  fontFamily,
  fontSize: 12,
  overflow: "hidden",
  position: "fixed",
  right: PANEL_OFFSET,
};

export const panelContentStyle: CSSProperties = {
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  position: "absolute",
  right: 0,
};

export const headerStyle: CSSProperties = {
  alignItems: "center",
  borderBottom: `1px solid ${palette.line}`,
  display: "flex",
  flex: "none",
  gap: 8,
  padding: "10px 14px",
};

export const activeTabStyle: CSSProperties = {
  background: palette.tealSoft,
  border: `1px solid ${palette.teal}`,
  borderRadius: 6,
  color: palette.teal,
  fontSize: 12,
  padding: "3px 10px",
};

export const headerCountStyle: CSSProperties = {
  color: palette.muted,
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

export const headerActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginLeft: "auto",
};

export const ghostButtonStyle: CSSProperties = {
  background: "transparent",
  border: `1px solid ${palette.line}`,
  borderRadius: 6,
  color: palette.muted,
  cursor: "pointer",
  fontFamily,
  fontSize: 11,
  padding: "3px 10px",
};

export const panelBodyStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  minHeight: 0,
};

export const tableWrapStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflowY: "auto",
};

export const tableEmptyStyle: CSSProperties = {
  color: palette.muted,
  margin: 0,
  padding: 16,
  textAlign: "center",
};

export const rowListStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const rowButtonStyle: CSSProperties = {
  alignItems: "center",
  appearance: "none",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${palette.line}`,
  borderRadius: 0,
  color: palette.text,
  cursor: "pointer",
  display: "flex",
  fontFamily,
  fontSize: 12,
  fontVariantNumeric: "tabular-nums",
  gap: 8,
  padding: "6px 12px",
  textAlign: "left",
  WebkitAppearance: "none",
  width: "100%",
};

export const rowButtonSelectedStyle: CSSProperties = {
  ...rowButtonStyle,
  background: palette.raised,
};

export const rowTimeStyle: CSSProperties = {
  color: palette.muted,
  flex: "none",
  fontSize: 11,
};

export const rowMethodStyle: CSSProperties = {
  color: palette.muted,
  flex: "none",
  fontSize: 11,
  fontWeight: 700,
  minWidth: 34,
};

export const rowUrlStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const chipBaseStyle: CSSProperties = {
  borderRadius: 999,
  flex: "none",
  fontSize: 10.5,
  fontVariantNumeric: "tabular-nums",
  padding: "0 8px",
};

export const chipOkStyle: CSSProperties = {
  ...chipBaseStyle,
  background: palette.tealSoft,
  border: `1px solid ${palette.teal}`,
  color: palette.teal,
};

export const chipErrorStyle: CSSProperties = {
  ...chipBaseStyle,
  background: palette.orangeSoft,
  border: `1px solid ${palette.orange}`,
  color: palette.orange,
};

export const mockBadgeStyle: CSSProperties = {
  ...chipBaseStyle,
  background: palette.orangeSoft,
  border: "1px solid transparent",
  color: palette.orange,
  fontSize: 10,
};

export const detailStyle: CSSProperties = {
  borderLeft: `1px solid ${palette.line}`,
  display: "flex",
  flex: "none",
  flexDirection: "column",
  gap: 8,
  overflowY: "auto",
  padding: 12,
  width: "min(220px, 50%)",
};

export const detailMetaStyle: CSSProperties = {
  color: palette.muted,
  fontSize: 11,
  lineHeight: 1.7,
  margin: 0,
  wordBreak: "break-all",
};

export const detailBodyStyle: CSSProperties = {
  background: palette.raised,
  borderRadius: 8,
  fontFamily: monoFontFamily,
  fontSize: 11,
  lineHeight: 1.6,
  margin: 0,
  overflowX: "auto",
  padding: 10,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};

export const detailEmptyBodyStyle: CSSProperties = {
  color: palette.muted,
  margin: 0,
};

export const panelClassNames = {
  actionButton: "rfd-btn",
  launcher: "rfd-launcher",
  row: "rfd-row",
} as const;

/** :hover·:focus-visible은 인라인 스타일로 표현 불가 — 패널이 직접 렌더하는 <style>용.
 *  !important는 인라인 스타일을 이기기 위함 */
export const panelInteractionCss = `
.${panelClassNames.launcher}:hover { border-color: ${palette.tealBright} !important; color: ${palette.tealBright} !important; }
.${panelClassNames.actionButton}:hover { border-color: ${palette.teal} !important; color: ${palette.text} !important; }
.${panelClassNames.row}:hover { background: ${palette.raised} !important; }
.${panelClassNames.row}:focus { outline: none; }
.${panelClassNames.row}:focus-visible,
.${panelClassNames.actionButton}:focus-visible,
.${panelClassNames.launcher}:focus-visible { outline: 2px solid ${palette.teal}; outline-offset: -2px; }
`;

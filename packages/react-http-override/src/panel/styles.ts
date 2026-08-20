import type { CSSProperties } from "react";

export const palette = {
  bg: "#141b1c",
  line: "#2c393b",
  muted: "#8fa1a3",
  orange: "#e8935c",
  orangeBright: "#f2b088",
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
export const PANEL_EXPANDED_WIDTH = "min(760px, calc(100vw - 32px))";
export const PANEL_EXPANDED_HEIGHT = "min(480px, calc(100vh - 32px))";

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

export const launcherButtonActiveStyle: CSSProperties = {
  ...launcherButtonStyle,
  border: `1px solid ${palette.orange}`,
};

/** 활성 룰 개수 뱃지 */
export const launcherRuleBadgeStyle: CSSProperties = {
  alignItems: "center",
  background: palette.orange,
  border: `2px solid ${palette.bg}`,
  borderRadius: 999,
  boxSizing: "border-box",
  color: palette.bg,
  display: "flex",
  fontSize: 9.5,
  fontVariantNumeric: "tabular-nums",
  fontWeight: 700,
  height: 18,
  justifyContent: "center",
  minWidth: 18,
  padding: "0 4px",
  pointerEvents: "none",
  position: "absolute",
  right: -5,
  top: -5,
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

export const embeddedPanelStyle: CSSProperties = {
  background: palette.bg,
  color: palette.text,
  display: "flex",
  flexDirection: "column",
  fontFamily,
  fontSize: 12,
  height: "100%",
  minHeight: 240,
  overflow: "hidden",
  width: "100%",
};

export const embeddedContentStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  minHeight: 0,
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
  appearance: "none",
  background: palette.tealSoft,
  border: `1px solid ${palette.teal}`,
  borderRadius: 6,
  color: palette.teal,
  cursor: "pointer",
  fontFamily,
  fontSize: 12,
  padding: "3px 10px",
  WebkitAppearance: "none",
};

export const inactiveTabStyle: CSSProperties = {
  ...activeTabStyle,
  background: "transparent",
  border: `1px solid ${palette.line}`,
  color: palette.muted,
};

export const headerCountStyle: CSSProperties = {
  color: palette.muted,
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
};

export const headerRuleCountStyle: CSSProperties = {
  color: palette.orange,
  fontSize: 11,
  fontVariantNumeric: "tabular-nums",
  fontWeight: 700,
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

export const filterBarStyle: CSSProperties = {
  alignItems: "center",
  borderBottom: `1px solid ${palette.line}`,
  display: "flex",
  flex: "none",
  flexWrap: "wrap",
  gap: 6,
  padding: "8px 12px",
};

export const filterChipStyle: CSSProperties = {
  appearance: "none",
  background: "transparent",
  border: `1px solid ${palette.line}`,
  borderRadius: 999,
  color: palette.muted,
  cursor: "pointer",
  fontFamily,
  fontSize: 10.5,
  fontVariantNumeric: "tabular-nums",
  padding: "1px 8px",
  WebkitAppearance: "none",
};

export const filterChipActiveStyle: CSSProperties = {
  ...filterChipStyle,
  background: palette.tealSoft,
  borderColor: palette.teal,
  color: palette.teal,
};

export const filterSearchStyle: CSSProperties = {
  background: palette.raised,
  border: `1px solid ${palette.line}`,
  borderRadius: 6,
  color: palette.text,
  flex: 1,
  fontFamily,
  fontSize: 11,
  minWidth: 80,
  padding: "2px 8px",
};

export const extraTabContentStyle: CSSProperties = {
  display: "flex",
  flex: 1,
  flexDirection: "column",
  minHeight: 0,
  overflow: "auto",
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
  borderLeft: "3px solid transparent",
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

export const rowRuledStripeStyle: CSSProperties = {
  borderLeft: `3px solid ${palette.orange}`,
};

const rowCountBadgeBaseStyle: CSSProperties = {
  borderRadius: 5,
  flex: "none",
  fontSize: 10.5,
  fontVariantNumeric: "tabular-nums",
  fontWeight: 700,
  minWidth: 22,
  padding: "1px 5px",
  textAlign: "center",
};

export const rowCountOkStyle: CSSProperties = {
  ...rowCountBadgeBaseStyle,
  background: palette.tealSoft,
  color: palette.teal,
};

export const rowCountErrorStyle: CSSProperties = {
  ...rowCountBadgeBaseStyle,
  background: palette.orangeSoft,
  color: palette.orange,
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

export const rowRuleChipStyle: CSSProperties = {
  ...chipBaseStyle,
  background: palette.orange,
  border: "1px solid transparent",
  color: palette.bg,
  fontSize: 10,
  fontWeight: 700,
};

export const mockBadgeStyle: CSSProperties = {
  ...chipBaseStyle,
  background: palette.orangeSoft,
  border: "1px solid transparent",
  color: palette.orange,
  fontSize: 10,
};

export const ruleBarStyle: CSSProperties = {
  borderTop: `1px solid ${palette.line}`,
  display: "flex",
  flex: "none",
  flexDirection: "column",
  gap: 4,
  maxHeight: 120,
  overflowY: "auto",
  padding: "6px 12px",
};

export const ruleBarHeaderStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 8,
  justifyContent: "space-between",
};

export const ruleRowStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 8,
};

export const rulePatternStyle: CSSProperties = {
  color: palette.muted,
  flex: 1,
  fontFamily: monoFontFamily,
  fontSize: 10.5,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

export const presetGroupStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

export const presetItemStyle: CSSProperties = {
  alignItems: "center",
  display: "inline-flex",
  gap: 2,
  maxWidth: "100%",
};

const presetChipBase: CSSProperties = {
  appearance: "none",
  background: "transparent",
  border: `1px solid ${palette.line}`,
  borderRadius: 999,
  color: palette.muted,
  cursor: "pointer",
  fontFamily,
  fontSize: 11,
  maxWidth: 150,
  overflow: "hidden",
  padding: "3px 9px",
  textOverflow: "ellipsis",
  WebkitAppearance: "none",
  whiteSpace: "nowrap",
};

export const presetChipStyle: CSSProperties = presetChipBase;

export const presetChipActiveStyle: CSSProperties = {
  ...presetChipBase,
  background: palette.tealSoft,
  borderColor: palette.teal,
  color: palette.teal,
  fontWeight: 700,
};

export const presetEditRowStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 4,
};

export const presetNameInputStyle: CSSProperties = {
  appearance: "none",
  background: palette.bg,
  border: `1px solid ${palette.teal}`,
  borderRadius: 6,
  color: palette.text,
  flex: 1,
  fontFamily,
  fontSize: 11.5,
  minWidth: 0,
  padding: "5px 8px",
};

export const detailStyle: CSSProperties = {
  borderLeft: `1px solid ${palette.line}`,
  display: "flex",
  flex: "none",
  flexDirection: "column",
  overflowY: "auto",
  width: "min(300px, 55%)",
};

/** RQ devtools식 섹션 헤더 바 */
export const detailSectionHeaderStyle: CSSProperties = {
  background: palette.raised,
  borderBottom: `1px solid ${palette.line}`,
  borderTop: `1px solid ${palette.line}`,
  color: palette.text,
  flex: "none",
  fontSize: 11.5,
  fontWeight: 700,
  padding: "5px 12px",
};

export const detailSectionBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: "8px 12px",
};

export const detailTopStyle: CSSProperties = {
  alignItems: "flex-start",
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  justifyContent: "space-between",
};

export const detailUrlStyle: CSSProperties = {
  color: palette.text,
  flex: 1,
  fontFamily: monoFontFamily,
  fontSize: 11,
  minWidth: 0,
  wordBreak: "break-all",
};

export const detailInfoRowStyle: CSSProperties = {
  color: palette.muted,
  display: "flex",
  fontSize: 11,
  gap: 8,
  justifyContent: "space-between",
};

export const detailInfoValueStyle: CSSProperties = {
  color: palette.text,
  fontVariantNumeric: "tabular-nums",
  textAlign: "right",
  wordBreak: "break-all",
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

export const treeContainerStyle: CSSProperties = {
  background: palette.raised,
  borderRadius: 8,
  fontFamily: monoFontFamily,
  fontSize: 11,
  lineHeight: 1.7,
  listStyle: "none",
  margin: 0,
  overflowX: "auto",
  padding: 8,
};

export const treeChildListStyle: CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  paddingLeft: 14,
};

export const treeRowStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: 4,
  minWidth: 0,
};

export const treeToggleButtonStyle: CSSProperties = {
  alignItems: "center",
  appearance: "none",
  background: "transparent",
  border: "none",
  color: palette.text,
  cursor: "pointer",
  display: "flex",
  font: "inherit",
  gap: 4,
  padding: "1px 2px",
  WebkitAppearance: "none",
};

export const treeToggleArrowStyle: CSSProperties = {
  color: palette.muted,
  fontSize: 8,
  width: 10,
};

export const treeKeyStyle: CSSProperties = {
  color: palette.text,
};

export const treeCountStyle: CSSProperties = {
  color: palette.muted,
  fontSize: 10,
};

export const treeCopyButtonStyle: CSSProperties = {
  appearance: "none",
  background: "transparent",
  border: "none",
  color: palette.muted,
  cursor: "pointer",
  font: "inherit",
  fontSize: 10,
  padding: "0 4px",
};

export const treeValueStringStyle: CSSProperties = {
  color: palette.teal,
  wordBreak: "break-all",
};

export const treeValueNumberStyle: CSSProperties = {
  color: palette.orange,
};

export const treeValueNullStyle: CSSProperties = {
  color: palette.muted,
};

export const treeTruncatedStyle: CSSProperties = {
  color: palette.muted,
};

export const actionSectionStyle: CSSProperties = {
  borderTop: `1px solid ${palette.line}`,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  paddingTop: 10,
};

export const actionLabelStyle: CSSProperties = {
  color: palette.muted,
  fontSize: 10.5,
};

export const actionRowStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const actionButtonBaseStyle: CSSProperties = {
  background: "transparent",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily,
  fontSize: 11,
  padding: "3px 10px",
};

export const actionPrimaryButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: palette.tealSoft,
  border: `1px solid ${palette.teal}`,
  color: palette.teal,
};

export const actionWarmButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  background: palette.orangeSoft,
  border: `1px solid ${palette.orange}`,
  color: palette.orange,
};

export const actionNeutralButtonStyle: CSSProperties = {
  ...actionButtonBaseStyle,
  border: `1px solid ${palette.line}`,
  color: palette.muted,
};

const actionInputBaseStyle: CSSProperties = {
  background: palette.raised,
  border: `1px solid ${palette.line}`,
  borderRadius: 6,
  color: palette.text,
  fontFamily,
  fontSize: 11,
  padding: "3px 8px",
};

export const actionStatusInputStyle: CSSProperties = {
  ...actionInputBaseStyle,
  fontVariantNumeric: "tabular-nums",
  width: 56,
};

export const actionBodyInputStyle: CSSProperties = {
  ...actionInputBaseStyle,
  boxSizing: "border-box",
  fontFamily: monoFontFamily,
  lineHeight: 1.5,
  minHeight: 40,
  resize: "vertical",
  width: "100%",
};

export const actionBodyHintJsonStyle: CSSProperties = {
  color: palette.teal,
  fontSize: 10,
};

export const actionBodyHintBrokenStyle: CSSProperties = {
  color: palette.orange,
  fontSize: 10,
};

export const panelClassNames = {
  actionButton: "rfd-btn",
  launcher: "rfd-launcher",
  row: "rfd-row",
  treeActions: "rfd-tree-actions",
  treeRow: "rfd-tree-row",
  warmButton: "rfd-btn-warm",
} as const;

/** :hover·:focus-visible은 인라인 스타일로 표현 불가 — 패널이 직접 렌더하는 <style>용.
 *  !important는 인라인 스타일을 이기기 위함 */
export const panelInteractionCss = `
.${panelClassNames.launcher}:hover { border-color: ${palette.tealBright} !important; color: ${palette.tealBright} !important; }
.${panelClassNames.actionButton}:hover { border-color: ${palette.teal} !important; color: ${palette.text} !important; }
.${panelClassNames.row}:hover { background: ${palette.raised} !important; }
.${panelClassNames.warmButton}:hover { border-color: ${palette.orangeBright} !important; color: ${palette.orangeBright} !important; }
.${panelClassNames.treeActions} { display: inline-flex; gap: 2px; opacity: 0; transition: opacity 80ms; }
.${panelClassNames.treeRow}:hover .${panelClassNames.treeActions},
.${panelClassNames.treeActions}:focus-within { opacity: 1; }
.${panelClassNames.row}:focus { outline: none; }
.${panelClassNames.row}:focus-visible,
.${panelClassNames.actionButton}:focus-visible,
.${panelClassNames.warmButton}:focus-visible,
.${panelClassNames.launcher}:focus-visible { outline: 2px solid ${palette.teal}; outline-offset: -2px; }
`;

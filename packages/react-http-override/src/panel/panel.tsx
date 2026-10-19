import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { HttpOverrideApi, HttpOverridePreset } from "../core";
import { ruleMatchesUrl } from "../core";
import { useRecords, useRules } from "./hooks";
import { RequestDetail } from "./request-detail";
import type { RequestGroup } from "./request-table";
import { isErrorRecord, isOkRecord, RequestTable } from "./request-table";
import { RuleBar } from "./rule-bar";
import {
  activeTabStyle,
  detailStyle,
  embeddedContentStyle,
  embeddedPanelStyle,
  extraTabContentStyle,
  filterBarStyle,
  filterChipActiveStyle,
  filterChipStyle,
  filterClearButtonStyle,
  filterSearchStyle,
  ghostButtonStyle,
  headerActionsStyle,
  headerCountStyle,
  headerRuleCountStyle,
  headerStyle,
  inactiveTabStyle,
  LAUNCHER_SIZE,
  palette,
  PANEL_EXPANDED_HEIGHT,
  PANEL_EXPANDED_WIDTH,
  PANEL_HEIGHT,
  PANEL_RADIUS,
  PANEL_WIDTH,
  panelBodyStyle,
  panelClassNames,
  panelContentStyle,
  panelCornerStyle,
  panelEdgeLeftStyle,
  panelEdgeTopStyle,
  panelGhostLabelStyle,
  panelStyle,
  resizeHandleActiveStyle,
  resizeHandleStyle,
  tableWrapStyle,
} from "./styles";
import { TABLE_MIN_WIDTH, useDetailWidth } from "./use-detail-width";
import { usePanelSize } from "./use-panel-size";

export const PANEL_CLOSE_DURATION_MS = 200;

const PANEL_OPEN_DURATION_MS = 300;
const OPEN_EASE = "cubic-bezier(0.22, 1.2, 0.36, 1)";
const CLOSE_EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

/** 임베드 탭 계약 — RQ devtools 패널 등 무엇이든 render()로 주입 (lazy 청크 안에서) */
export type HttpOverrideTab = {
  key: string;
  label: string;
  render: () => ReactNode;
};

/** 런처·임베드 패널이 공유하는 옵션 — 한쪽에만 추가되는 실수 방지 */
export type HttpOverridePanelOptions = {
  /** 확장 탭 — 다른 devtools 패널 임베드 지점 */
  extraTabs?: HttpOverrideTab[];
  /** 앱이 정의한 룰 묶음 — 행 상세에서 URL이 매칭되는 것만 표시 */
  presets?: HttpOverridePreset[];
};

export type PanelProps = HttpOverridePanelOptions & {
  api: HttpOverrideApi;
  embedded?: boolean;
  onClose: () => void;
  shown: boolean;
  zIndex: number;
};

export const Panel = ({
  api,
  embedded,
  extraTabs,
  onClose,
  presets,
  shown,
  zIndex,
}: PanelProps) => {
  const records = useRecords(api);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<
    "all" | "error" | "mock" | "ok" | "pending"
  >(
    "all"
  );
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("api");
  const activeExtraTab = extraTabs?.find((tab) => tab.key === activeTab);
  const [reducedMotion] = useState(
    () =>
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const handleHideClick = useCallback(() => {
    api.hide();
    onClose();
  }, [api, onClose]);

  useEffect(() => {
    if (embedded === true) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [embedded, onClose]);

  const handleSelectGroup = useCallback((key: string) => {
    setSelectedKey((current) => (current === key ? null : key));
  }, []);

  // 같은 method+URL은 한 행으로 묶고 최신 기록을 대표로 (RQ devtools 방식)
  const groups = useMemo(() => {
    const map = new Map<string, RequestGroup>();
    for (const record of records) {
      const key = `${record.method} ${record.url}`;
      const existing = map.get(key);
      if (existing === undefined) {
        map.set(key, { count: 1, key, latest: record });
      } else {
        existing.count += 1;
        existing.latest = record;
      }
    }
    return [...map.values()].sort((a, b) => b.latest.seq - a.latest.seq);
  }, [records]);

  const selected =
    selectedKey === null
      ? null
      : (groups.find((group) => group.key === selectedKey)?.latest ?? null);

  const rules = useRules(api);
  const ruledKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const group of groups) {
      const matched = rules.some((rule) =>
        ruleMatchesUrl(rule.pattern, group.latest.url)
      );
      if (matched) keys.add(group.key);
    }
    return keys;
  }, [groups, rules]);

  const counts = useMemo(() => {
    const isError = (group: RequestGroup) => isErrorRecord(group.latest);
    const isOk = (group: RequestGroup) => isOkRecord(group.latest);
    return {
      all: groups.length,
      error: groups.filter(isError).length,
      mock: groups.filter((group) => group.latest.mocked).length,
      ok: groups.filter(isOk).length,
      pending: groups.filter((group) => group.latest.state === "pending")
        .length,
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return groups.filter((group) => {
      if (keyword !== "" && !group.latest.url.toLowerCase().includes(keyword)) {
        return false;
      }
      const isError = isErrorRecord(group.latest);
      if (filterKind === "error") return isError;
      if (filterKind === "ok") return isOkRecord(group.latest);
      if (filterKind === "mock") return group.latest.mocked;
      if (filterKind === "pending") return group.latest.state === "pending";
      return true;
    });
  }, [filterKind, groups, query]);

  const handleClear = useCallback(() => {
    api.records.clear();
    setSelectedKey(null);
  }, [api]);

  const detail = useDetailWidth();
  const panelSize = usePanelSize();
  const expanded = selected !== null;
  /* 상세를 기본보다 넓히면 목록 최소 너비를 남기고 패널 자체가 왼쪽으로 자란다 */
  const expandedWidth =
    detail.width === null
      ? PANEL_EXPANDED_WIDTH
      : `min(max(760px, ${detail.width + TABLE_MIN_WIDTH}px), calc(100vw - 32px))`;
  const defaultWidth = expanded ? expandedWidth : PANEL_WIDTH;
  const defaultHeight = expanded ? PANEL_EXPANDED_HEIGHT : PANEL_HEIGHT;
  /* 사용자가 패널 크기를 직접 정했으면 열림·확장 구분 없이 그 크기를 쓴다 */
  const targetWidth =
    panelSize.size === null
      ? defaultWidth
      : `min(${panelSize.size.width}px, calc(100vw - 32px))`;
  const targetHeight =
    panelSize.size === null
      ? defaultHeight
      : `min(${panelSize.size.height}px, calc(100vh - 32px))`;
  const resizing = detail.resizing || panelSize.resizing;

  const animatedPanelStyle = useMemo(() => {
    if (embedded === true) return { ...embeddedPanelStyle, zIndex };
    const duration = shown ? PANEL_OPEN_DURATION_MS : PANEL_CLOSE_DURATION_MS;
    const ease = shown ? OPEN_EASE : CLOSE_EASE;
    return {
      ...panelStyle,
      border: `1px solid ${shown ? palette.line : palette.teal}`,
      borderRadius: shown ? PANEL_RADIUS : LAUNCHER_SIZE / 2,
      height: shown ? targetHeight : LAUNCHER_SIZE,
      transition:
        reducedMotion || resizing
          ? undefined
          : `width ${duration}ms ${ease}, height ${duration}ms ${ease}, border-radius ${duration}ms ${ease}, border-color ${duration}ms ${ease}`,
      width: shown ? targetWidth : LAUNCHER_SIZE,
      zIndex,
    };
  }, [embedded, reducedMotion, resizing, shown, targetHeight, targetWidth, zIndex]);

  const contentStyle = useMemo(() => {
    if (embedded === true) return embeddedContentStyle;
    const opacityTransition = shown
      ? "opacity 160ms ease-out 90ms"
      : "opacity 100ms ease-out";
    return {
      ...panelContentStyle,
      height: targetHeight,
      opacity: shown ? 1 : 0,
      transition:
        reducedMotion || resizing
          ? undefined
          : `width ${PANEL_OPEN_DURATION_MS}ms ${OPEN_EASE}, height ${PANEL_OPEN_DURATION_MS}ms ${OPEN_EASE}, ${opacityTransition}`,
      width: targetWidth,
    };
  }, [embedded, reducedMotion, resizing, shown, targetHeight, targetWidth]);

  const asideStyle = useMemo(
    () =>
      detail.width === null ? detailStyle : { ...detailStyle, width: detail.width },
    [detail.width]
  );

  const ghostLabelStyle = useMemo(() => {
    const transition = shown
      ? "opacity 100ms ease-out"
      : "opacity 120ms ease-out 60ms";
    return {
      ...panelGhostLabelStyle,
      opacity: shown ? 0 : 1,
      transition: reducedMotion ? undefined : transition,
    };
  }, [reducedMotion, shown]);

  return (
    <section
      ref={panelSize.panelRef}
      aria-label="API devtools 패널"
      data-expanded={expanded}
      role="dialog"
      style={animatedPanelStyle}>
      {embedded !== true && shown && (
        <>
          <div
            aria-label="패널 너비 조절 (더블클릭: 기본값)"
            aria-orientation="vertical"
            className={panelClassNames.panelEdge}
            data-active={panelSize.resizing}
            role="separator"
            style={panelEdgeLeftStyle}
            tabIndex={0}
            title="드래그해서 패널 너비 조절 · 더블클릭하면 기본값"
            {...panelSize.handleFor("x")}
          />
          <div
            aria-label="패널 높이 조절 (더블클릭: 기본값)"
            aria-orientation="horizontal"
            className={panelClassNames.panelEdge}
            data-active={panelSize.resizing}
            role="separator"
            style={panelEdgeTopStyle}
            tabIndex={0}
            title="드래그해서 패널 높이 조절 · 더블클릭하면 기본값"
            {...panelSize.handleFor("y")}
          />
          <div
            aria-label="패널 크기 조절 (더블클릭: 기본값)"
            className={panelClassNames.panelEdge}
            data-active={panelSize.resizing}
            role="separator"
            style={panelCornerStyle}
            tabIndex={0}
            title="드래그해서 패널 크기 조절 · 더블클릭하면 기본값"
            {...panelSize.handleFor("both")}
          />
        </>
      )}
      <div style={contentStyle}>
        <header style={headerStyle}>
          <button
            style={activeTab === "api" ? activeTabStyle : inactiveTabStyle}
            type="button"
            onClick={() => setActiveTab("api")}>
            API
          </button>
          {extraTabs?.map((tab) => (
            <button
              key={tab.key}
              style={activeTab === tab.key ? activeTabStyle : inactiveTabStyle}
              type="button"
              onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
          <span style={headerCountStyle}>{records.length}건</span>
          {rules.length > 0 && (
            <span style={headerRuleCountStyle}>룰 {rules.length}</span>
          )}
          {embedded !== true && (
            <div style={headerActionsStyle}>
              <button
                className={panelClassNames.actionButton}
                style={ghostButtonStyle}
                type="button"
                onClick={handleHideClick}>
                버튼 숨기기
              </button>
              <button
                aria-label="패널 닫기"
                className={panelClassNames.actionButton}
                style={ghostButtonStyle}
                type="button"
                onClick={onClose}>
                ✕
              </button>
            </div>
          )}
        </header>
        {activeExtraTab !== undefined && (
          <div style={extraTabContentStyle}>{activeExtraTab.render()}</div>
        )}
        {activeExtraTab === undefined &&
          (
            <>
              <div style={filterBarStyle}>
                {searchOpen ? (
                  <>
                    <input
                      aria-label="URL 검색"
                      placeholder="URL 검색"
                      style={filterSearchStyle}
                      value={query}
                      autoFocus
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          event.stopPropagation();
                          setSearchOpen(false);
                        }
                      }}
                    />
                    <button
                      aria-label="검색 닫기"
                      className={panelClassNames.actionButton}
                      style={filterChipStyle}
                      type="button"
                      onClick={() => setSearchOpen(false)}>
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    {(
                      [
                        ["all", `전체 ${counts.all}`],
                        ["pending", `대기 ${counts.pending}`],
                        ["ok", `정상 ${counts.ok}`],
                        ["error", `에러 ${counts.error}`],
                        ["mock", `MOCK ${counts.mock}`],
                      ] as const
                    ).map(([kind, label]) => (
                      <button
                        key={kind}
                        className={panelClassNames.actionButton}
                        style={
                          filterKind === kind
                            ? filterChipActiveStyle
                            : filterChipStyle
                        }
                        type="button"
                        onClick={() => setFilterKind(kind)}>
                        {label}
                      </button>
                    ))}
                    <button
                      aria-label="URL 검색 열기"
                      className={panelClassNames.actionButton}
                      style={
                        query !== "" ? filterChipActiveStyle : filterChipStyle
                      }
                      type="button"
                      onClick={() => setSearchOpen(true)}>
                      🔍{query !== "" && " •"}
                    </button>
                    <button
                      className={panelClassNames.actionButton}
                      style={filterClearButtonStyle}
                      type="button"
                      onClick={handleClear}>
                      Clear
                    </button>
                  </>
                )}
              </div>
              <div style={panelBodyStyle}>
                <div style={tableWrapStyle}>
                  <RequestTable
                    groups={filteredGroups}
                    ruledKeys={ruledKeys}
                    selectedKey={selectedKey}
                    onSelectGroup={handleSelectGroup}
                  />
                </div>
                {selected !== null && (
                  <div
                    aria-label="상세 너비 조절 (더블클릭: 기본값)"
                    aria-orientation="vertical"
                    className={panelClassNames.resizeHandle}
                    role="separator"
                    style={
                      detail.resizing
                        ? resizeHandleActiveStyle
                        : resizeHandleStyle
                    }
                    tabIndex={0}
                    title="드래그해서 상세 너비 조절 · 더블클릭하면 기본값"
                    {...detail.handleProps}
                  />
                )}
                {selected !== null && (
                  <aside ref={detail.asideRef} style={asideStyle}>
                    <RequestDetail
                      key={selectedKey}
                      api={api}
                      presets={presets}
                      record={selected}
                    />
                  </aside>
                )}
              </div>
              <RuleBar api={api} />
            </>
          )}
      </div>
      {embedded !== true && (
        <span aria-hidden="true" style={ghostLabelStyle}>
          API
        </span>
      )}
    </section>
  );
};

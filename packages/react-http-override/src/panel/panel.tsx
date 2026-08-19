import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  HttpOverrideApi,
  HttpOverrideCacheAdapter,
  HttpOverridePreset,
} from "../core";
import { ruleMatchesUrl } from "../core";
import { CacheTab } from "./cache-tab";
import { useRecords, useRules } from "./hooks";
import { RequestDetail } from "./request-detail";
import type { RequestGroup } from "./request-table";
import { RequestTable } from "./request-table";
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
  panelGhostLabelStyle,
  panelStyle,
  tableWrapStyle,
} from "./styles";

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
  /** SWR이면 createSwrAdapter로 생성 — 미주입 시 Cache 탭 숨김 */
  cacheAdapter?: HttpOverrideCacheAdapter;
  /** 확장 탭 — 다른 devtools 패널 임베드 지점 */
  extraTabs?: HttpOverrideTab[];
  /** 재요청 콜백 — 요청 URL(또는 캐시 키)이 전달됩니다. 미주입 시 재요청 버튼 숨김 */
  onRevalidate?: (key: string) => void;
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
  cacheAdapter,
  embedded,
  extraTabs,
  onClose,
  onRevalidate,
  presets,
  shown,
  zIndex,
}: PanelProps) => {
  const records = useRecords(api);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [filterKind, setFilterKind] = useState<"all" | "error" | "mock" | "ok">(
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
    const isError = (group: RequestGroup) =>
      group.latest.status === 0 || group.latest.status >= 400;
    return {
      all: groups.length,
      error: groups.filter(isError).length,
      mock: groups.filter((group) => group.latest.mocked).length,
      ok: groups.filter((group) => !isError(group)).length,
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return groups.filter((group) => {
      if (keyword !== "" && !group.latest.url.toLowerCase().includes(keyword)) {
        return false;
      }
      const isError = group.latest.status === 0 || group.latest.status >= 400;
      if (filterKind === "error") return isError;
      if (filterKind === "ok") return !isError;
      if (filterKind === "mock") return group.latest.mocked;
      return true;
    });
  }, [filterKind, groups, query]);

  const handleClear = useCallback(() => {
    api.records.clear();
    setSelectedKey(null);
  }, [api]);

  const expanded = selected !== null;
  const targetWidth = expanded ? PANEL_EXPANDED_WIDTH : PANEL_WIDTH;
  const targetHeight = expanded ? PANEL_EXPANDED_HEIGHT : PANEL_HEIGHT;

  const animatedPanelStyle = useMemo(() => {
    if (embedded === true) return { ...embeddedPanelStyle, zIndex };
    const duration = shown ? PANEL_OPEN_DURATION_MS : PANEL_CLOSE_DURATION_MS;
    const ease = shown ? OPEN_EASE : CLOSE_EASE;
    return {
      ...panelStyle,
      border: `1px solid ${shown ? palette.line : palette.teal}`,
      borderRadius: shown ? PANEL_RADIUS : LAUNCHER_SIZE / 2,
      height: shown ? targetHeight : LAUNCHER_SIZE,
      transition: reducedMotion
        ? undefined
        : `width ${duration}ms ${ease}, height ${duration}ms ${ease}, border-radius ${duration}ms ${ease}, border-color ${duration}ms ${ease}`,
      width: shown ? targetWidth : LAUNCHER_SIZE,
      zIndex,
    };
  }, [embedded, reducedMotion, shown, targetHeight, targetWidth, zIndex]);

  const contentStyle = useMemo(() => {
    if (embedded === true) return embeddedContentStyle;
    const opacityTransition = shown
      ? "opacity 160ms ease-out 90ms"
      : "opacity 100ms ease-out";
    return {
      ...panelContentStyle,
      height: targetHeight,
      opacity: shown ? 1 : 0,
      transition: reducedMotion
        ? undefined
        : `width ${PANEL_OPEN_DURATION_MS}ms ${OPEN_EASE}, height ${PANEL_OPEN_DURATION_MS}ms ${OPEN_EASE}, ${opacityTransition}`,
      width: targetWidth,
    };
  }, [embedded, reducedMotion, shown, targetHeight, targetWidth]);

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
      aria-label="API devtools 패널"
      role="dialog"
      style={animatedPanelStyle}>
      <div style={contentStyle}>
        <header style={headerStyle}>
          <button
            style={activeTab === "api" ? activeTabStyle : inactiveTabStyle}
            type="button"
            onClick={() => setActiveTab("api")}>
            API
          </button>
          {cacheAdapter !== undefined && (
            <button
              style={activeTab === "cache" ? activeTabStyle : inactiveTabStyle}
              type="button"
              onClick={() => setActiveTab("cache")}>
              Cache
            </button>
          )}
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
          (activeTab === "cache" && cacheAdapter !== undefined ? (
            <CacheTab cacheAdapter={cacheAdapter} onRevalidate={onRevalidate} />
          ) : (
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
                      style={ghostButtonStyle}
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
                  <aside style={detailStyle}>
                    <RequestDetail
                      key={selectedKey}
                      api={api}
                      presets={presets}
                      record={selected}
                      onRevalidate={onRevalidate}
                    />
                  </aside>
                )}
              </div>
              <RuleBar api={api} />
            </>
          ))}
      </div>
      {embedded !== true && (
        <span aria-hidden="true" style={ghostLabelStyle}>
          API
        </span>
      )}
    </section>
  );
};

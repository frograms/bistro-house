import { useCallback, useEffect, useMemo, useState } from "react";

import type { FetchDevtoolsApi } from "../core";
import { useRecords } from "./hooks";
import { JsonViewer } from "./json-viewer";
import type { RequestGroup } from "./request-table";
import { RequestTable } from "./request-table";
import { RowActions } from "./row-actions";
import {
  activeTabStyle,
  detailStyle,
  ghostButtonStyle,
  headerActionsStyle,
  headerCountStyle,
  headerStyle,
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

export type PanelProps = {
  api: FetchDevtoolsApi;
  onClose: () => void;
  onRevalidate?: (key: string) => void;
  /** false→true 전환으로 오픈 애니메이션 재생 */
  shown: boolean;
  zIndex: number;
};

export const Panel = ({
  api,
  onClose,
  onRevalidate,
  shown,
  zIndex,
}: PanelProps) => {
  const records = useRecords(api);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

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

  const expanded = selected !== null;
  const targetWidth = expanded ? PANEL_EXPANDED_WIDTH : PANEL_WIDTH;
  const targetHeight = expanded ? PANEL_EXPANDED_HEIGHT : PANEL_HEIGHT;

  // scale 대신 width/height 모프 — 내용이 찌그러지지 않고, 버튼(44px 원)과 패널 사이를
  // 같은 박스가 오간다. 열릴 땐 오버슈트 이징으로 살짝 튀며 정착.
  // 상세보기 확장·축소도 같은 width/height 전환을 재사용한다
  const animatedPanelStyle = useMemo(() => {
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
  }, [reducedMotion, shown, targetHeight, targetWidth, zIndex]);

  const contentStyle = useMemo(() => {
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
  }, [reducedMotion, shown, targetHeight, targetWidth]);

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
    <section aria-label="API devtools 패널" role="dialog" style={animatedPanelStyle}>
      <div style={contentStyle}>
        <header style={headerStyle}>
          <span style={activeTabStyle}>API</span>
          <span style={headerCountStyle}>{records.length}건</span>
          <div style={headerActionsStyle}>
            <button
              className={panelClassNames.actionButton}
              style={ghostButtonStyle}
              type="button"
              onClick={handleHideClick}
            >
              버튼 숨기기
            </button>
            <button
              aria-label="패널 닫기"
              className={panelClassNames.actionButton}
              style={ghostButtonStyle}
              type="button"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </header>
        <div style={panelBodyStyle}>
          <div style={tableWrapStyle}>
            <RequestTable
              groups={groups}
              selectedKey={selectedKey}
              onSelectGroup={handleSelectGroup}
            />
          </div>
          {selected !== null && (
            <aside style={detailStyle}>
              <JsonViewer record={selected} />
              <RowActions
                key={selectedKey}
                api={api}
                record={selected}
                onRevalidate={onRevalidate}
              />
            </aside>
          )}
        </div>
      </div>
      <span aria-hidden="true" style={ghostLabelStyle}>
        API
      </span>
    </section>
  );
};

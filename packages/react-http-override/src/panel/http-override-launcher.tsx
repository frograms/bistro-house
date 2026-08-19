import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { HttpOverrideCacheAdapter } from "../cache-adapter";
import type { HttpOverrideApi, HttpOverridePreset } from "../core";
import { useLauncherVisible, useRules } from "./hooks";
import type { HttpOverrideTab } from "./panel";
import { Panel, PANEL_CLOSE_DURATION_MS } from "./panel";
import {
  launcherButtonActiveStyle,
  launcherButtonStyle,
  launcherRuleBadgeStyle,
  panelClassNames,
  panelInteractionCss,
} from "./styles";

export type HttpOverrideLauncherProps = {
  /** SWR이면 createSwrAdapter로 생성 — 미주입 시 Cache 탭 숨김 */
  cacheAdapter?: HttpOverrideCacheAdapter;
  enabled: boolean;
  /** 확장 탭 — RQ devtools 패널 임베드 지점 */
  extraTabs?: HttpOverrideTab[];
  /** 재요청 콜백 — 미주입 시 재요청 버튼 숨김 */
  onRevalidate?: (key: string) => void;
  /** 앱이 정의한 룰 묶음 */
  presets?: HttpOverridePreset[];
  zIndex?: number;
};

const LauncherContent = ({
  api,
  cacheAdapter,
  extraTabs,
  onRevalidate,
  presets,
  zIndex,
}: {
  api: HttpOverrideApi;
  cacheAdapter?: HttpOverrideCacheAdapter;
  extraTabs?: HttpOverrideTab[];
  onRevalidate?: (key: string) => void;
  presets?: HttpOverridePreset[];
  zIndex: number;
}) => {
  const visible = useLauncherVisible(api);
  const ruleCount = useRules(api).length;
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      setShown(true);
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  const close = useCallback(() => {
    setShown(false);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, PANEL_CLOSE_DURATION_MS);
  }, []);

  const toggleOpen = useCallback(() => {
    if (open) {
      close();
      return;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    setOpen(true);
  }, [close, open]);

  const launcherStyle = useMemo(
    () => ({
      ...(ruleCount > 0 ? launcherButtonActiveStyle : launcherButtonStyle),
      zIndex,
    }),
    [ruleCount, zIndex]
  );

  return createPortal(
    <div>
      <style>{panelInteractionCss}</style>
      {visible && !open && (
        <button
          aria-label="API devtools"
          className={panelClassNames.launcher}
          style={launcherStyle}
          type="button"
          onClick={toggleOpen}>
          API
          {ruleCount > 0 && (
            <span aria-hidden="true" style={launcherRuleBadgeStyle}>
              {ruleCount}
            </span>
          )}
        </button>
      )}
      {open && (
        <Panel
          api={api}
          cacheAdapter={cacheAdapter}
          extraTabs={extraTabs}
          presets={presets}
          shown={shown}
          zIndex={zIndex}
          onClose={close}
          onRevalidate={onRevalidate}
        />
      )}
    </div>,
    document.body
  );
};

export const HttpOverrideLauncher = ({
  cacheAdapter,
  enabled,
  extraTabs,
  onRevalidate,
  presets,
  zIndex = 999999,
}: HttpOverrideLauncherProps) => {
  if (!enabled || typeof window === "undefined") return null;
  const api = window.__HTTP_OVERRIDE__;
  if (api === undefined) return null;
  return (
    <LauncherContent
      api={api}
      cacheAdapter={cacheAdapter}
      extraTabs={extraTabs}
      presets={presets}
      zIndex={zIndex}
      onRevalidate={onRevalidate}
    />
  );
};

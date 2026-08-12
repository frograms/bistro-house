import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { FetchDevtoolsApi } from "../core";
import { useLauncherVisible, useRules } from "./hooks";
import { Panel, PANEL_CLOSE_DURATION_MS } from "./panel";
import {
  launcherButtonActiveStyle,
  launcherButtonStyle,
  launcherRuleBadgeStyle,
  panelClassNames,
  panelInteractionCss,
} from "./styles";

export type DevtoolsLauncherProps = {
  enabled: boolean;
  /** 재요청 콜백 — 미주입 시 재요청 버튼 숨김 */
  onRevalidate?: (key: string) => void;
  zIndex?: number;
};

const LauncherContent = ({
  api,
  onRevalidate,
  zIndex,
}: {
  api: FetchDevtoolsApi;
  onRevalidate?: (key: string) => void;
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

export const DevtoolsLauncher = ({
  enabled,
  onRevalidate,
  zIndex = 999999,
}: DevtoolsLauncherProps) => {
  if (!enabled || typeof window === "undefined") return null;
  const api = window.__API_DEVTOOLS__;
  if (api === undefined) return null;
  return (
    <LauncherContent api={api} zIndex={zIndex} onRevalidate={onRevalidate} />
  );
};

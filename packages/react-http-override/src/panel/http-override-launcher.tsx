import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { HttpOverrideApi } from "../core";
import { useHttpOverrideApi, useLauncherVisible, useRules } from "./hooks";
import type { HttpOverridePanelOptions } from "./panel";
import { Panel, PANEL_CLOSE_DURATION_MS } from "./panel";
import {
  launcherButtonActiveStyle,
  launcherButtonStyle,
  launcherRuleBadgeStyle,
  panelClassNames,
  panelInteractionCss,
} from "./styles";

export type HttpOverrideLauncherProps = HttpOverridePanelOptions & {
  zIndex?: number;
};

const LauncherContent = ({
  api,
  extraTabs,
  presets,
  zIndex,
}: HttpOverridePanelOptions & {
  api: HttpOverrideApi;
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
          extraTabs={extraTabs}
          presets={presets}
          shown={shown}
          zIndex={zIndex}
          onClose={close}
        />
      )}
    </div>,
    document.body
  );
};

export const HttpOverrideLauncher = ({
  extraTabs,
  presets,
  zIndex = 999999,
}: HttpOverrideLauncherProps) => {
  const api = useHttpOverrideApi();
  if (api === null) return null;
  return (
    <LauncherContent
      api={api}
      extraTabs={extraTabs}
      presets={presets}
      zIndex={zIndex}
    />
  );
};

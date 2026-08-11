import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { FetchDevtoolsApi } from "../core";
import { useLauncherVisible } from "./hooks";
import { Panel, PANEL_CLOSE_DURATION_MS } from "./panel";
import {
  launcherButtonStyle,
  panelClassNames,
  panelInteractionCss,
} from "./styles";

export type DevtoolsLauncherProps = {
  enabled: boolean;
  zIndex?: number;
};

const LauncherContent = ({
  api,
  zIndex,
}: {
  api: FetchDevtoolsApi;
  zIndex: number;
}) => {
  const visible = useLauncherVisible(api);
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
    () => ({ ...launcherButtonStyle, zIndex }),
    [zIndex]
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
          onClick={toggleOpen}
        >
          API
        </button>
      )}
      {open && <Panel api={api} shown={shown} zIndex={zIndex} onClose={close} />}
    </div>,
    document.body
  );
};

export const DevtoolsLauncher = ({
  enabled,
  zIndex = 999999,
}: DevtoolsLauncherProps) => {
  if (!enabled || typeof window === "undefined") return null;
  const api = window.__API_DEVTOOLS__;
  if (api === undefined) return null;
  return <LauncherContent api={api} zIndex={zIndex} />;
};

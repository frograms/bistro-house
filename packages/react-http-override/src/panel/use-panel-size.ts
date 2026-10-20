import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "__HTTP_OVERRIDE_PANEL_SIZE__";

export const PANEL_MIN_WIDTH = 320;
export const PANEL_MIN_HEIGHT = 200;
const VIEWPORT_MARGIN = 32;
const KEYBOARD_STEP = 24;

export type PanelSize = { height: number; width: number };
export type ResizeAxis = "both" | "x" | "y";

const readStoredSize = (): PanelSize | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as PanelSize).width !== "number" ||
      typeof (parsed as PanelSize).height !== "number"
    ) {
      return null;
    }
    return clampSize(parsed as PanelSize);
  } catch {
    return null;
  }
};

const persistSize = (size: PanelSize | null) => {
  try {
    if (size === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify(size));
  } catch {
    // 저장 불가 환경(프라이빗 모드 등)은 이번 세션만 유지
  }
};

const clampSize = ({ height, width }: PanelSize): PanelSize => ({
  height: Math.round(
    Math.min(
      Math.max(height, PANEL_MIN_HEIGHT),
      window.innerHeight - VIEWPORT_MARGIN
    )
  ),
  width: Math.round(
    Math.min(
      Math.max(width, PANEL_MIN_WIDTH),
      window.innerWidth - VIEWPORT_MARGIN
    )
  ),
});

type Drag = { axis: ResizeAxis; start: PanelSize; startX: number; startY: number };

/** 패널 전체 크기. null이면 기본값(열림/확장 상태별 CSS), 끌어서 바꾸면 px로 고정되고 localStorage에 남는다 */
export const usePanelSize = () => {
  const [size, setSize] = useState<PanelSize | null>(readStoredSize);
  const [resizing, setResizing] = useState(false);
  const panelRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<Drag | null>(null);

  useEffect(() => {
    persistSize(size);
  }, [size]);

  const currentSize = useCallback((): PanelSize | null => {
    const panel = panelRef.current;
    if (panel === null) return null;
    const rect = panel.getBoundingClientRect();
    return { height: rect.height, width: rect.width };
  }, []);

  const endDrag = useCallback((event: ReactPointerEvent) => {
    if (dragRef.current === null) return;
    dragRef.current = null;
    setResizing(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // 이미 해제된 포인터
    }
  }, []);

  const handleFor = useCallback(
    (axis: ResizeAxis) => ({
      onDoubleClick: () => {
        setSize(null);
      },
      onKeyDown: (event: ReactKeyboardEvent) => {
        const start = currentSize();
        if (start === null) return;
        const grow = (dx: number, dy: number) => {
          event.preventDefault();
          setSize(
            clampSize({
              height: start.height + (axis === "x" ? 0 : dy),
              width: start.width + (axis === "y" ? 0 : dx),
            })
          );
        };
        // 패널은 오른쪽 아래에 붙어 있어 왼쪽·위로 갈수록 커진다
        if (event.key === "ArrowLeft") grow(KEYBOARD_STEP, 0);
        else if (event.key === "ArrowRight") grow(-KEYBOARD_STEP, 0);
        else if (event.key === "ArrowUp") grow(0, KEYBOARD_STEP);
        else if (event.key === "ArrowDown") grow(0, -KEYBOARD_STEP);
      },
      onLostPointerCapture: endDrag,
      onPointerCancel: endDrag,
      onPointerDown: (event: ReactPointerEvent) => {
        const start = currentSize();
        if (start === null || event.button !== 0) return;
        event.preventDefault();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // 캡처 불가 환경에서도 move/up이 핸들 위에서 오는 동안은 동작
        }
        dragRef.current = {
          axis,
          start,
          startX: event.clientX,
          startY: event.clientY,
        };
        setResizing(true);
      },
      onPointerMove: (event: ReactPointerEvent) => {
        const drag = dragRef.current;
        if (drag === null) return;
        const dx = drag.axis === "y" ? 0 : drag.startX - event.clientX;
        const dy = drag.axis === "x" ? 0 : drag.startY - event.clientY;
        setSize(
          clampSize({
            height: drag.start.height + dy,
            width: drag.start.width + dx,
          })
        );
      },
      onPointerUp: endDrag,
    }),
    [currentSize, endDrag]
  );

  return { handleFor, panelRef, resizing, size };
};

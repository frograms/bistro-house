import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { SUPPORTS_POINTER_EVENTS, trackMouseDrag } from "./mouse-drag";

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
  const stopMouseDragRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    persistSize(size);
  }, [size]);

  useEffect(
    () => () => {
      stopMouseDragRef.current?.();
    },
    []
  );

  const currentSize = useCallback((): PanelSize | null => {
    const panel = panelRef.current;
    if (panel === null) return null;
    const rect = panel.getBoundingClientRect();
    return { height: rect.height, width: rect.width };
  }, []);

  const beginDrag = useCallback(
    (axis: ResizeAxis, clientX: number, clientY: number): boolean => {
      const start = currentSize();
      if (start === null) return false;
      dragRef.current = { axis, start, startX: clientX, startY: clientY };
      setResizing(true);
      return true;
    },
    [currentSize]
  );

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    const drag = dragRef.current;
    if (drag === null) return;
    const dx = drag.axis === "y" ? 0 : drag.startX - clientX;
    const dy = drag.axis === "x" ? 0 : drag.startY - clientY;
    setSize(
      clampSize({
        height: drag.start.height + dy,
        width: drag.start.width + dx,
      })
    );
  }, []);

  const finishDrag = useCallback(() => {
    if (dragRef.current === null) return false;
    dragRef.current = null;
    stopMouseDragRef.current = null;
    setResizing(false);
    return true;
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent) => {
      if (!finishDrag()) return;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // 이미 해제된 포인터
      }
    },
    [finishDrag]
  );

  const handleMouseDown = useCallback(
    (axis: ResizeAxis, event: ReactMouseEvent) => {
      if (event.button !== 0 || !beginDrag(axis, event.clientX, event.clientY)) {
        return;
      }
      event.preventDefault();
      stopMouseDragRef.current = trackMouseDrag((moveEvent) => {
        moveDrag(moveEvent.clientX, moveEvent.clientY);
      }, finishDrag);
    },
    [beginDrag, finishDrag, moveDrag]
  );

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
      onMouseDown: SUPPORTS_POINTER_EVENTS
        ? undefined
        : (event: ReactMouseEvent) => {
            handleMouseDown(axis, event);
          },
      onPointerCancel: endDrag,
      onPointerDown: (event: ReactPointerEvent) => {
        if (event.button !== 0 || !beginDrag(axis, event.clientX, event.clientY)) {
          return;
        }
        event.preventDefault();
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // 캡처 불가 환경에서도 move/up이 핸들 위에서 오는 동안은 동작
        }
      },
      onPointerMove: (event: ReactPointerEvent) => {
        moveDrag(event.clientX, event.clientY);
      },
      onPointerUp: endDrag,
    }),
    [beginDrag, currentSize, endDrag, handleMouseDown, moveDrag]
  );

  return { handleFor, panelRef, resizing, size };
};

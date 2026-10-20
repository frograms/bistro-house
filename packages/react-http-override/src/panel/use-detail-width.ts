import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "__HTTP_OVERRIDE_DETAIL_WIDTH__";

export const DETAIL_MIN_WIDTH = 220;
/** 상세를 아무리 넓혀도 요청 목록에 남겨 둘 최소 너비 */
export const TABLE_MIN_WIDTH = 260;
export const RESIZE_HANDLE_WIDTH = 6;
const KEYBOARD_STEP = 24;

const readStoredWidth = (): number | null => {
  try {
    const value = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value >= DETAIL_MIN_WIDTH ? value : null;
  } catch {
    return null;
  }
};

const persistWidth = (width: number | null) => {
  try {
    if (width === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, String(Math.round(width)));
  } catch {
    // 저장 불가 환경(프라이빗 모드 등)은 이번 세션만 유지
  }
};

const maxDetailWidth = () =>
  window.innerWidth - 32 - TABLE_MIN_WIDTH - RESIZE_HANDLE_WIDTH;

const clamp = (width: number) =>
  Math.min(Math.max(width, DETAIL_MIN_WIDTH), maxDetailWidth());

/** 상세 영역 너비. null이면 기본값(CSS), 드래그·키보드로 조절하면 px로 고정되고 localStorage에 남는다 */
export const useDetailWidth = () => {
  const [width, setWidth] = useState<number | null>(readStoredWidth);
  const [resizing, setResizing] = useState(false);
  const asideRef = useRef<HTMLElement | null>(null);
  const dragRef = useRef<{ startWidth: number; startX: number; } | null>(null);

  useEffect(() => {
    persistWidth(width);
  }, [width]);

  const handlePointerDown = useCallback((event: ReactPointerEvent) => {
    const aside = asideRef.current;
    if (aside === null || event.button !== 0) return;
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // 캡처 불가 환경에서도 move/up이 핸들 위에서 오는 동안은 동작
    }
    dragRef.current = {
      startWidth: aside.getBoundingClientRect().width,
      startX: event.clientX,
    };
    setResizing(true);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (drag === null) return;
    // 상세는 오른쪽에 붙어 있어 왼쪽으로 끌수록 넓어진다
    setWidth(clamp(drag.startWidth + (drag.startX - event.clientX)));
  }, []);

  /* pointerup 외에 취소·캡처 상실로 끝나는 경우도 드래그를 반드시 닫는다.
     안 닫히면 이후 지나가는 pointermove마다 너비가 바뀐다 */
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

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const aside = asideRef.current;
    if (aside === null) return;
    const current = aside.getBoundingClientRect().width;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setWidth(clamp(current + KEYBOARD_STEP));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setWidth(clamp(current - KEYBOARD_STEP));
    }
  }, []);

  const reset = useCallback(() => {
    setWidth(null);
  }, []);

  return {
    asideRef,
    handleProps: {
      onDoubleClick: reset,
      onKeyDown: handleKeyDown,
      onLostPointerCapture: endDrag,
      onPointerCancel: endDrag,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
    },
    resizing,
    width,
  };
};

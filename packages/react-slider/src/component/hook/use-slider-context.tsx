import { useEventCallback } from "@watcha-authentic/react-event-callback";
import React, { useLayoutEffect, useRef } from "react";

import { SliderItemContext } from "../context/slider-context";

type UseSliderContextProps = {
  onBlur?: () => void;
  onFocus?: (isAutoSlide: boolean) => void;
  onInitialState?: (focused: boolean) => void;
  /**
   * - 페이지 전환 시 호출되는 콜백입니다.
   * - t: 0 ~ 1 사이의 값 (0: fade in, 1: fade out)
   * - immediate: true 면 실시간으로 값이 바뀌고 있음을 의미하고, false 면 값이 완전히 바뀌었으므로 애니메이션을 트리거 할 수 있다는 의미 입니다.
   */
  onTransitionChange?: (t: number, immediate: boolean) => void;
};

export const useSliderContext = (callbacks: UseSliderContextProps) => {
  const context = React.useContext(SliderItemContext);

  if (!context) {
    throw new Error(
      "useSliderContext must be used within SliderItemContextProvider"
    );
  }

  const stableOnBlur = useEventCallback(callbacks.onBlur);
  const stableOnFocus = useEventCallback(callbacks.onFocus);
  const stableOnInitialState = useEventCallback(callbacks.onInitialState);
  const stableOnTransitionChange = useEventCallback(
    callbacks.onTransitionChange
  );
  const prevFocusedRef = useRef<boolean | null>(null);

  /**
   * - 초기 마운트 또는 상태 변경시 콜백 호출
   */
  useLayoutEffect(() => {
    const isInitialMount = prevFocusedRef.current === null;

    if (prevFocusedRef.current !== context.isFocused) {
      if (isInitialMount) {
        // 초기 마운트 시 onInitialState 호출
        stableOnInitialState(context.isFocused);
      } else {
        // 상태 변경 시 onBlur/onFocus 호출
        if (context.isFocused) {
          stableOnFocus(context.slideTriggerEvent === "swipe");
        } else {
          stableOnBlur();
        }
      }
      prevFocusedRef.current = context.isFocused;
    }
  }, [
    context.isFocused,
    context.slideTriggerEvent,
    stableOnBlur,
    stableOnFocus,
    stableOnInitialState,
  ]);

  /**
   * - transition 값 변경 시 콜백 호출
   */
  useLayoutEffect(() => {
    stableOnTransitionChange(context.transition, context.immediate);
  }, [context.transition, context.immediate, stableOnTransitionChange]);
};

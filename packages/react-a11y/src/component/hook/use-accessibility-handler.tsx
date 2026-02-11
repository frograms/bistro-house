import { useEventCallback } from "@watcha-authentic/react-event-callback";
import { useCallback, useEffect, useMemo } from "react";

import type { UseAccessibilityHandlerOptions } from "../../script/type/accessibility-type";

type UseAccessibilityHandlerProps<ElementType extends HTMLElement> = {
  target: React.RefObject<ElementType | null>;
  handler: (event: KeyboardEvent) => void;
  options?: UseAccessibilityHandlerOptions<ElementType>;
};

export const useAccessibilityHandler = <ElementType extends HTMLElement>({
  handler,
  options,
  target,
}: UseAccessibilityHandlerProps<ElementType>) => {
  const stableHandler = useEventCallback(handler);

  const enableAccessibility = useCallback(
    (enable: boolean) => {
      target.current?.removeEventListener("keydown", stableHandler);

      if (enable && target.current) {
        target.current.addEventListener("keydown", stableHandler);
        if (options?.withAutoFocus ?? false) target.current.focus();
      }
    },
    [stableHandler, target, options?.withAutoFocus]
  );

  /**
   * - 해당 element 의 keydown 이벤트를 바인딩 합니다.
   */
  useEffect(() => {
    const lastActiveElement = window.document.activeElement;
    // unbind
    enableAccessibility(false);

    // bind
    enableAccessibility(true);

    return () => {
      enableAccessibility(false);

      const focusTarget =
        options?.returnTarget === "last-active-element"
          ? lastActiveElement
          : options?.returnTarget;
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();
      }
    };
  }, [enableAccessibility, options?.returnTarget]);

  return { enableAccessibility };
};

import { useEventCallback } from "@watcha-authentic/react-event-callback";
import { useCallback, useEffect } from "react";

type UseAccessibilityHandlerProps<ElementType extends HTMLElement> = {
  /**
   * - 포커스 복귀 대상 element 의 ref 값입니다.
   */
  returnTarget?:
    | Document
    | React.RefObject<ElementType | null>
    | "last-active-element";
  target: React.RefObject<ElementType | null>;
  handler: (event: KeyboardEvent) => void;
};

export const useAccessibilityHandler = <ElementType extends HTMLElement>({
  handler,
  returnTarget,
  target,
}: UseAccessibilityHandlerProps<ElementType>) => {
  const stableHandler = useEventCallback(handler);

  const enableAccessibility = useCallback(
    (enable: boolean) => {
      target.current?.removeEventListener("keydown", stableHandler);

      if (enable && target.current) {
        target.current.addEventListener("keydown", stableHandler);
        target.current.focus();
      }
    },
    [stableHandler, target]
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
        returnTarget === "last-active-element"
          ? lastActiveElement
          : returnTarget;
      if (focusTarget instanceof HTMLElement) {
        focusTarget.focus();
      }
    };
  }, [enableAccessibility, returnTarget]);

  return { enableAccessibility };
};

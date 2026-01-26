import { useEventCallback } from "@watcha-authentic/react-event-callback";
import { useCallback, useEffect } from "react";

type UseAccessibilityHandlerProps<ElementType extends HTMLElement> = {
  target: React.RefObject<ElementType | null>;
  handler: (event: KeyboardEvent) => void;
};

export const useAccessibilityHandler = <ElementType extends HTMLElement>({
  handler,
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

  useEffect(() => {
    // unbind
    enableAccessibility(false);

    // bind
    enableAccessibility(true);

    return () => {
      enableAccessibility(false);
    };
  }, [enableAccessibility]);

  return { enableAccessibility };
};

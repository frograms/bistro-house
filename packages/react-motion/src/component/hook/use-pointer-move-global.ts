import { useEffect, useMemo } from "react";

import type {
  UsePointerMoveActions,
  UsePointerMoveProps,
} from "./use-pointer-move.js";
import { usePointerMove } from "./use-pointer-move.js";

type UsePointerMoveGlobalActions<ElementType extends Node = HTMLElement> = Omit<
  UsePointerMoveActions<ElementType>,
  "pointerEvents" | "withPointerMove"
> & {
  withPointerMove: Pick<
    UsePointerMoveActions<ElementType>["withPointerMove"],
    "ref" | "style"
  >;
};

type UsePointerMoveGlobalProps<ElementType extends Node = HTMLElement> =
  {} & UsePointerMoveProps<ElementType>;

// TODO hmr
export const usePointerMoveGlobal = <ElementType extends Node = HTMLElement>(
  props: UsePointerMoveGlobalProps<ElementType>
): UsePointerMoveGlobalActions<ElementType> => {
  const {
    nativePointerHandlers,
    withPointerMove,
    // pointerEvents 를 rest 에서 omit 합니다.
    pointerEvents: _pointerEvents,
    ...rest
  } = usePointerMove<ElementType>(props);

  // pointer 이벤트 리스너 등록
  useEffect(() => {
    // enabled가 false면 이벤트 리스너를 등록하지 않음
    if (props.enabled === false) {
      return;
    }

    document.body.addEventListener(
      "pointerdown",
      nativePointerHandlers.handlePointerDown
    );
    document.body.addEventListener(
      "pointermove",
      nativePointerHandlers.handlePointerMove
    );
    document.body.addEventListener(
      "pointerup",
      nativePointerHandlers.handlePointerUp
    );
    document.body.addEventListener(
      "pointercancel",
      nativePointerHandlers.handlePointerCancel
    );
    document.body.addEventListener(
      "pointerleave",
      nativePointerHandlers.handlePointerLeave
    );

    return () => {
      document.body.removeEventListener(
        "pointerdown",
        nativePointerHandlers.handlePointerDown
      );
      document.body.removeEventListener(
        "pointermove",
        nativePointerHandlers.handlePointerMove
      );
      document.body.removeEventListener(
        "pointerup",
        nativePointerHandlers.handlePointerUp
      );
      document.body.removeEventListener(
        "pointercancel",
        nativePointerHandlers.handlePointerCancel
      );
      document.body.removeEventListener(
        "pointerleave",
        nativePointerHandlers.handlePointerLeave
      );
    };
  }, [
    nativePointerHandlers.handlePointerCancel,
    nativePointerHandlers.handlePointerDown,
    nativePointerHandlers.handlePointerLeave,
    nativePointerHandlers.handlePointerMove,
    nativePointerHandlers.handlePointerUp,
    props.enabled,
  ]);

  // pointerEvents 를 omit 시키기 위함
  const withPointerMoveReturn: UsePointerMoveGlobalActions<ElementType>["withPointerMove"] =
    useMemo(
      () => ({
        ref: withPointerMove.ref,
        style: withPointerMove.style,
      }),
      [withPointerMove.ref, withPointerMove.style]
    );

  return {
    ...rest,
    nativePointerHandlers,
    withPointerMove: withPointerMoveReturn,
  };
};

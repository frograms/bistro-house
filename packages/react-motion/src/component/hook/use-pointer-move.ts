import { useEventCallback } from "@watcha-authentic/react-event-callback";
import type {
  CSSProperties,
  HTMLAttributes,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type {
  Calculate,
  NativePointerEventHandlers,
  PointerEvents,
  PointerEventType,
  PointerMoveData,
  PointerTransaction,
} from "../../script/type/pointer-move-types";
import type { Point2D } from "../../script/type/primitives";
import { getDistance, subtractPoint } from "../../script/util/point-utils";
import {
  clonePointerTransaction,
  defaultPointerTransaction,
  initializePointerTransaction,
} from "../../script/util/pointer-move-utils";

export type UsePointerMoveActions<ElementType extends Node = HTMLElement> = {
  cursorStyle: CSSProperties["cursor"] | undefined;
  defaultStyle: HTMLAttributes<ElementType>["style"];
  nativePointerHandlers: NativePointerEventHandlers;
  pointerEvents: PointerEvents<ElementType>;
  style: HTMLAttributes<ElementType>["style"];
  /**
   * - 이 값으로 dom 에 속성을 부여(전개) 하면 target 프롭스로 받은 ref 값을 dom 에 별도로 할당 하지 않고도 할당 할 수 있습니다.
   */
  withPointerMove: {
    ref: RefObject<ElementType | null>;
    style: HTMLAttributes<ElementType>["style"];
  } & PointerEvents<ElementType>;
};

export type UsePointerMoveProps<ElementType extends Node = HTMLElement> = {
  defaultCursorStyle?: CSSProperties["cursor"];
  /**
   * - 드래그 기능 활성화 여부입니다. 기본값은 true 입니다.
   */
  enabled?: boolean;
  movingCursorStyle?: CSSProperties["cursor"];
  target: RefObject<ElementType | null>;
  /**
   * - 드래그 <> 클릭을 구분하는 임계값(px). 기본값은 5 입니다.
   */
  dragThreshold?: number;
  onDraggingNow?: (isDragging: boolean) => void;
  onPointDrag?: (data: PointerMoveData) => void;
};

const DEFAULT_STYLE: HTMLAttributes<HTMLElement>["style"] = {
  touchAction: "none",
};

const getDefaultPointer = ({
  calculate,
  isPrimary,
  type,
  x,
  y,
}: {
  calculate: Calculate;
  isPrimary: boolean;
  type: PointerEventType;
  x: number;
  y: number;
}) => {
  return {
    calculate,
    end: undefined,
    isPrimary,
    move: undefined,
    start: undefined,
    [type]: { x, y },
  };
};

// TODO hmr
export const usePointerMove = <ElementType extends Node = HTMLElement>({
  defaultCursorStyle,
  dragThreshold = 5,
  enabled = true,
  movingCursorStyle = "grabbing",
  target,
  onDraggingNow,
  onPointDrag,
}: UsePointerMoveProps<ElementType>): UsePointerMoveActions<ElementType> => {
  const [cursorStyle, setCursorStyle] = useState<
    CSSProperties["cursor"] | undefined
  >(defaultCursorStyle);
  const isPointerDown = useRef(false);
  const transaction = useRef<PointerTransaction>(defaultPointerTransaction);
  const clickCheckInfo = useRef<{
    isBlockingClick: boolean;
    lastPoint: Point2D | undefined;
  }>({
    isBlockingClick: false,
    lastPoint: undefined,
  });

  const stableOnPointDrag = useEventCallback(onPointDrag);
  const stableOnDraggingNow = useEventCallback(onDraggingNow);

  const handlePointerEvent = useCallback(
    (data: PointerMoveData) => {
      // 드래그 <> 클릭 로직
      const { isEnd, transaction } = data;
      let isBlockingClickValue = false;
      const calculate = transaction.primaryPointer?.calculate ?? undefined;
      if (calculate) {
        isBlockingClickValue = calculate.distance > dragThreshold;
        const x = (clickCheckInfo.current.lastPoint?.x ?? 0) + calculate.diff.x;
        const y = (clickCheckInfo.current.lastPoint?.y ?? 0) + calculate.diff.y;
        if (isEnd) {
          clickCheckInfo.current.lastPoint = { x, y };
        }
      }
      clickCheckInfo.current.isBlockingClick = isBlockingClickValue;

      // 드래그 이벤트 콜백 호출
      stableOnPointDrag(data);

      // 드래그가 종료되는 경우 프레임기반으로 차단 상태를 초기화. 이 코드로 인해 다시 내부 컴포넌트의 클릭 이벤트가 릴리즈 됩니다.
      if (isEnd) {
        requestAnimationFrame(() => {
          clickCheckInfo.current.isBlockingClick = false;
        });
      }
    },
    [dragThreshold, stableOnPointDrag]
  );

  const updateTriggerBy = useCallback((eventTarget: EventTarget | null) => {
    if (eventTarget instanceof Element) {
      transaction.current.triggerBy = eventTarget;
    } else {
      console.warn(
        "이벤트를 발생시킨 요소가 Element 가 아니거나, null 입니다."
      );
    }
  }, []);

  const isSameTarget = useCallback(
    (checkTarget: EventTarget | null) => {
      return (
        target.current &&
        checkTarget instanceof Element &&
        target.current.contains(checkTarget)
      );
    },
    [target]
  );

  const calcPointers = useCallback(
    ({ event, type }: { event: PointerEvent; type: PointerEventType }) => {
      const { clientX: x, clientY: y, isPrimary, pointerId } = event;

      const target = transaction.current.pointers.get(pointerId);
      const startPoint = target?.start;

      const calculate: Calculate = {
        diff: startPoint ? subtractPoint({ x, y }, startPoint) : { x: 0, y: 0 },
        distance: startPoint ? getDistance({ x, y }, startPoint) : 0,
      };

      // 현재 이벤트 키에 반영합니다.
      if (!target) {
        // 트랜잭션의 포인터 id 에 대한, 값이 초기화 되지 않은 경우
        transaction.current.pointers.set(
          pointerId,
          getDefaultPointer({ calculate, isPrimary, type, x, y })
        );
      } else {
        // 초기화 되어 있는 경우 나머지 값을 업데이트 합니다.
        target[type] = { x, y };
        target.calculate = calculate;
        target.isPrimary = isPrimary;
      }

      // 만약 start 이벤트가 아닌데 start 값이 할당 되어 있지 않다면 초기화 해줍니다. (예를들어 pointer down 없이 바로 이벤트가 들어오는 경우)
      if (type !== "start" && startPoint === undefined) {
        updateTriggerBy(event.target);
        isPointerDown.current = true;
        calcPointers({ event, type: "start" });
      }

      if (isPrimary) {
        transaction.current.primaryPointer =
          target ?? getDefaultPointer({ calculate, isPrimary, type, x, y });
      }
    },
    [updateTriggerBy]
  );

  const startTransaction = useCallback(
    (event: PointerEvent) => {
      if (!enabled || !isSameTarget(event.target)) {
        return;
      }

      transaction.current.type = "start";

      updateTriggerBy(event.target);
      isPointerDown.current = true;
      calcPointers({ event, type: "start" });

      // fire distance event
      handlePointerEvent({
        event,
        isCancel: false,
        isEnd: false,
        transaction: clonePointerTransaction(transaction.current),
      });
      stableOnDraggingNow(true);
    },
    [
      calcPointers,
      enabled,
      isSameTarget,
      stableOnDraggingNow,
      handlePointerEvent,
      updateTriggerBy,
    ]
  );

  const updateTransaction = useCallback(
    (event: PointerEvent) => {
      if (!isSameTarget(transaction.current.triggerBy)) {
        return;
      }

      transaction.current.type = "move";

      // update transaction
      calcPointers({ event, type: "move" });

      if (isPointerDown.current) {
        // fire distance event
        handlePointerEvent({
          event,
          isCancel: false,
          isEnd: false,
          transaction: clonePointerTransaction(transaction.current),
        });
        stableOnDraggingNow(true);
      }

      // update cursor style
      if (isPointerDown.current) {
        setCursorStyle(movingCursorStyle);
      } else {
        setCursorStyle(defaultCursorStyle);
      }
    },
    [
      calcPointers,
      defaultCursorStyle,
      movingCursorStyle,
      isSameTarget,
      stableOnDraggingNow,
      handlePointerEvent,
    ]
  );

  const endTransaction = useCallback(
    (event: PointerEvent, isCancel = false) => {
      if (!isSameTarget(transaction.current.triggerBy)) {
        return;
      }

      const prevPointerDown = isPointerDown.current;

      transaction.current.type = "end";
      isPointerDown.current = false;

      // end transaction
      calcPointers({ event, type: "end" });

      if (prevPointerDown) {
        // fire distance event
        handlePointerEvent({
          event,
          isCancel,
          isEnd: true,
          transaction: clonePointerTransaction(transaction.current),
        });
      }
      stableOnDraggingNow(false);

      // update cursor style
      setCursorStyle(defaultCursorStyle);

      // 모든 이벤트를 버블링 했으므로 값을 초기화 합니다.
      transaction.current = initializePointerTransaction();
    },
    [
      calcPointers,
      defaultCursorStyle,
      isSameTarget,
      stableOnDraggingNow,
      handlePointerEvent,
    ]
  );

  // #region native handlers
  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      startTransaction(event);
    },
    [startTransaction]
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      updateTransaction(event);
    },
    [updateTransaction]
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent) => {
      endTransaction(event);
    },
    [endTransaction]
  );

  const handlePointerCancel = useCallback(
    (event: PointerEvent) => {
      if (transaction.current.type !== "pending") {
        endTransaction(event, true);
      }
    },
    [endTransaction]
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent) => {
      if (transaction.current.type !== "pending") {
        endTransaction(event);
      }
    },
    [endTransaction]
  );

  // #endregion

  // #region handlers
  const onPointerDown = useCallback(
    (event: ReactPointerEvent<ElementType>) => {
      handlePointerDown(event.nativeEvent);
    },
    [handlePointerDown]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<ElementType>) => {
      handlePointerMove(event.nativeEvent);
    },
    [handlePointerMove]
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<ElementType>) => {
      handlePointerUp(event.nativeEvent);
    },
    [handlePointerUp]
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<ElementType>) => {
      handlePointerCancel(event.nativeEvent);
    },
    [handlePointerCancel]
  );

  const onPointerLeave = useCallback(
    (event: ReactPointerEvent<ElementType>) => {
      handlePointerLeave(event.nativeEvent);
    },
    [handlePointerLeave]
  );
  // #endregion

  const style: HTMLAttributes<ElementType>["style"] = useMemo(() => {
    return {
      ...DEFAULT_STYLE,
      cursor: cursorStyle,
    };
  }, [cursorStyle]);

  // 클릭 이벤트 캡처링 단계에서 차단 (드래그 중 또는 드래그 후 의도치 않은 클릭 방지)
  useEffect(() => {
    const currentTarget = target.current;
    // enabled가 false면 이벤트 리스너를 등록하지 않음
    if (!enabled || !currentTarget) {
      return;
    }

    const handleClickCapture = (e: Event) => {
      // 드래그 중이거나 드래그가 발생했으면 클릭 차단
      if (clickCheckInfo.current.isBlockingClick) {
        e.preventDefault();
        e.stopPropagation();

        clickCheckInfo.current.isBlockingClick = false;
      }
    };

    currentTarget.addEventListener("click", handleClickCapture, true);

    return () => {
      currentTarget.removeEventListener("click", handleClickCapture, true);
    };
  }, [enabled, target]);

  return {
    cursorStyle,
    defaultStyle: DEFAULT_STYLE,
    nativePointerHandlers: {
      handlePointerCancel,
      handlePointerDown,
      handlePointerLeave,
      handlePointerMove,
      handlePointerUp,
    },
    pointerEvents: {
      onPointerCancel,
      onPointerDown,
      onPointerLeave,
      onPointerMove,
      onPointerUp,
    },
    style,
    withPointerMove: {
      ref: target,
      style,
      onPointerCancel,
      onPointerDown,
      onPointerLeave,
      onPointerMove,
      onPointerUp,
    },
  };
};

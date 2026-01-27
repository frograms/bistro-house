import { useAccessibilityHandler } from "@watcha-authentic/react-a11y";
import { useEventCallback } from "@watcha-authentic/react-event-callback";
import {
  addPoint,
  type Point2D,
  usePointerMove,
} from "@watcha-authentic/react-motion";
import type { CSSProperties } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { SlideTriggerEvent } from "../../script/type/slider-types";
import { SliderItemContextProvider } from "../context/slider-context-provider";

// TODO: loop false 에 대한 기능 추가

/**
 * - 드래그로 페이지 전환을 트리거하는 임계값 비율 (아이템 너비 기준)
 */
const CAN_SCROLL_THRESHOLD_RATIO = 0.15;
const DEFAULT_SCROLL_THRESHOLD = 125;

export type SliderRef = HTMLUListElement & {
  doNext: () => void;
  doPrev: () => void;
};

type ExtendedItem<ItemType> = {
  /**
   * - 확장된 배열에서의 인덱스
   */
  extendedIndex: number;
  /**
   * - 원본 아이템
   */
  item: ItemType;
  /**
   * - 원본 배열에서의 인덱스
   */
  originalIndex: number;
};

type SliderProps<ItemType> = {
  itemProps?: React.HTMLAttributes<HTMLLIElement>;
  wrapProps?: React.HTMLAttributes<HTMLUListElement>;
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
  items: Array<ItemType>;
  onCreateItemView: (item: ItemType, index: number) => React.ReactNode;
  onItemKey: (item: ItemType) => React.Key;
  /**
   * - 높이, 드래그 임계값 등의 사이즈 관련 값을 추정하는 방식을 선택 합니다. 기본값은 false 입니다.
   * - true: 모든 자식요소로부터 추정합니다. 가장 큰 사이즈값이 선택 됩니다.
   * - false: 첫번째 자식요소의 사이즈를 사용합니다.
   */
  estimateSizeFromEveryElements?: boolean;
  /**
   * - item 간 거리입니다.
   * - 기본값은 0 입니다.
   */
  gap?: number;
  /**
   * - 슬라이드 애니메이션 지속 시간(milliseconds)입니다.
   * - 기본값은 500 입니다.
   */
  animationDuration?: number;
  /**
   * - 슬라이드 애니메이션 타이밍 함수입니다.
   * - 기본값은 "ease" 입니다.
   */
  animationTimingFunction?: CSSProperties["transitionTimingFunction"];
  /**
   * - 초기 인덱스입니다.
   * - 기본값은 0 입니다.
   */
  defaultIndex?: number;
  /**
   * - currentIndex 입니다. 이 값이 변경되면 애니메이션이 동작 될 수 있습니다.
   * - 기본값은 defaultIndex 입니다.
   */
  index?: number;
  /**
   * - 중앙 기준 좌우로 보여줄 요소 개수입니다.
   * - 예: 1이면 좌1 + 중앙1 + 우1 = 3개, 2이면 좌2 + 중앙1 + 우2 = 5개
   * - 기본값은 1 입니다.
   */
  visibleCount?: number;
  /**
   * - 인덱스 변경 시 호출되는 콜백입니다.
   * - cause: 슬라이드 원인 ('swipe': 키보드 네비게이션, 'drag': 드래그/스와이프, undefined: 외부 prop 변경)
   */
  onIndexChange?: (newIndex: number, cause: SlideTriggerEvent) => void;
  /**
   * - 드래그 기능 활성화 여부입니다.
   * - 기본값은 true 입니다.
   */
  enableDrag?: boolean;
  onDraggingNow?: (isDragging: boolean) => void;
};

type ElementState = {
  point: Point2D;
  /**
   * - 드래그 시 기준이 되는 원본 위치
   */
  originPoint: Point2D;
  zIndex: number;
  /**
   * - 개별 요소의 애니메이션 활성화 여부
   * - 점프하는 요소(왼쪽↔오른쪽)는 false
   */
  enableAnimation: boolean;
  /**
   * - 현재 위치 타입
   * - "center" | "left" | "right"
   */
  positionType: "center" | "left" | "right";
  /**
   * - 중앙으로부터의 거리 비율 (0~1)
   * - 0: 정중앙, 1: 한 아이템 너비만큼 떨어짐
   */
  transition: number;
};

type ElementInfo = {
  content: HTMLDivElement | null;
  item: HTMLLIElement | null;
};

const SliderComponent = <ItemType = unknown,>(
  {
    animationDuration = 500,
    animationTimingFunction = "ease",
    defaultIndex = 0,
    enableDrag = true,
    estimateSizeFromEveryElements = false,
    gap = 0,
    index = defaultIndex,
    itemProps,
    contentProps,
    items,
    visibleCount = 1,
    wrapProps,
    onCreateItemView,
    onDraggingNow,
    onIndexChange,
    onItemKey,
  }: SliderProps<ItemType>,
  ref: React.ForwardedRef<HTMLUListElement>
) => {
  const stableOnIndexChange = useEventCallback(onIndexChange);

  /**
   * - 아이템이 부족할 경우 복제하여 확장된 아이템 배열을 생성합니다.
   * - 최소 필요 개수: 2 * (visibleCount + 1) + 1
   */
  const extendedItems = useMemo(() => {
    const minItems = 2 * (visibleCount + 1) + 1;
    const mult = items.length > 0 ? Math.ceil(minItems / items.length) : 1;
    const extended: ExtendedItem<ItemType>[] = [];

    for (let m = 0; m < mult; m++) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item === undefined) {
          console.warn("Item element 를 찾을 수 없습니다.", {
            minItems,
            mult,
            items,
            m,
            i,
          });
          continue;
        }

        extended.push({
          extendedIndex: m * items.length + i,
          item,
          originalIndex: i,
        });
      }
    }

    return extended;
  }, [items, visibleCount]);

  /**
   * - 드래그 애니메이션 활성화 여부
   */
  const [enableScrollAnimator, setEnableScrollAnimator] = useState(false);
  // slider 페이지 인덱스, 아이템 포지션 정보 등
  const [sliderInfo, setSliderInfo] = useState<{
    currentIndex: number;
    elementStates: Array<ElementState>;
    height: number;
  }>({
    currentIndex: index,
    elementStates: [],
    height: 0,
  });

  const wrapRef = useRef<HTMLUListElement>(null);
  // 아이템 element ref 값
  const elementInfos = useRef<Map<number, ElementInfo>>(new Map());
  // 콜백 호출용 인덱스 값
  const prevCallbackIndex = useRef(sliderInfo.currentIndex);
  // 드래그 임계값 (px, 동적으로 계산됨)
  const canScrollThreshold = useRef(DEFAULT_SCROLL_THRESHOLD);
  const lastSlideTriggerEvent = useRef<SlideTriggerEvent>("pending");
  const lastSliderInfoCurrentIndex = useRef(sliderInfo.currentIndex);
  const animateNow = useRef(false);
  const animateChecker = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const stopAnimateCheck = useCallback(() => {
    clearTimeout(animateChecker.current);
    animateChecker.current = undefined;
  }, []);

  const startAnimateCheck = useCallback(() => {
    stopAnimateCheck();
    return new Promise<void>((resolve) => {
      animateChecker.current = setTimeout(() => {
        animateNow.current = false;
        resolve();
      }, animationDuration);
    });
  }, [animationDuration, stopAnimateCheck]);

  /**
   * - element reference 를 저장 합니다.
   */
  const updateElement = useCallback(
    ({
      elementInfo: { content, item },
      index,
    }: {
      elementInfo: Partial<Pick<ElementInfo, "content" | "item">>;
      index: number;
    }) => {
      let elementInfo = elementInfos.current.get(index);
      if (!elementInfo) {
        elementInfo = {
          content: null,
          item: null,
        };
        elementInfos.current.set(index, elementInfo);
      }

      // null 은 값을 null 로 설정 할 수 있어야 합니다.
      if (item !== undefined) {
        elementInfo.item = item;
      }
      if (content !== undefined) {
        elementInfo.content = content;
      }
    },
    []
  );

  /**
   * - element 의 상태(position 등)를 계산 합니다.
   */
  const calcElementState = useCallback(
    ({
      centerIndex,
      elementIndex,
      itemSize,
      prevState,
    }: {
      centerIndex: number;
      elementIndex: number;
      itemSize: { height: number; width: number };
      prevState?: ElementState;
    }): ElementState => {
      const { width } = itemSize;
      const { length } = extendedItems;

      // 원형 배열에서 centerIndex 기준으로 시계방향/반시계방향 거리 계산
      const clockwiseDistance = (elementIndex - centerIndex + length) % length;
      const counterClockwiseDistance =
        (centerIndex - elementIndex + length) % length;

      let positionType: ElementState["positionType"];
      let point: Point2D;
      let zIndex: number;

      if (elementIndex === centerIndex) {
        // center
        positionType = "center";
        point = { x: 0, y: 0 };
        zIndex = length; // 가장 높음
      } else if (counterClockwiseDistance <= clockwiseDistance) {
        // 왼쪽 (반시계방향이 더 가깝거나 같음)
        positionType = "left";

        if (counterClockwiseDistance <= visibleCount) {
          // visibleCount 범위 내: 거리에 따라 왼쪽으로 이동
          point = { x: -(width + gap) * counterClockwiseDistance, y: 0 };
          zIndex = length - counterClockwiseDistance;
        } else {
          // 범위 밖: 가장 바깥 위치에 고정
          point = { x: -(width + gap) * (visibleCount + 1), y: 0 };
          zIndex = 0;
        }
      } else {
        // 오른쪽 (시계방향이 더 가까움)
        positionType = "right";

        if (clockwiseDistance <= visibleCount) {
          // visibleCount 범위 내: 거리에 따라 오른쪽으로 이동
          point = { x: (width + gap) * clockwiseDistance, y: 0 };
          zIndex = length - clockwiseDistance;
        } else {
          // 범위 밖: 가장 바깥 위치에 고정
          point = { x: (width + gap) * (visibleCount + 1), y: 0 };
          zIndex = 0;
        }
      }

      // 점프 여부 확인:
      // 왼쪽 <> 오른쪽 이동 시만 점프 (애니메이션 비활성화)
      // 범위 밖으로 나가거나 들어올 때는 애니메이션 유지
      const isJumping =
        prevState &&
        ((prevState.positionType === "left" && positionType === "right") ||
          (prevState.positionType === "right" && positionType === "left"));

      // transition 계산: 중앙으로부터 떨어진 거리 비율 (0~1)
      // 기준: 아이템 너비 + gap
      const itemWidth = width + gap;
      const transition = Math.min(
        1,
        Math.max(0, Math.abs(point.x) / itemWidth)
      );

      return {
        enableAnimation: !isJumping,
        originPoint: point,
        point,
        positionType,
        transition,
        zIndex,
      };
    },
    [extendedItems, gap, visibleCount]
  );

  const getNewStatesByItems = useCallback(
    ({
      centerIndex,
      enableAnimation = false,
      itemIndexs,
      prevStates,
    }: {
      centerIndex: number;
      itemIndexs: Array<number>;
      // TODO options 로 통합?
      enableAnimation?: boolean;
      prevStates?: Array<ElementState>;
    }) => {
      return itemIndexs.map<ElementState>((itemIndex) => {
        const prevState = prevStates?.[itemIndex];

        const item = elementInfos.current.get(itemIndex)?.item;
        if (!item) {
          console.warn("Item element 를 찾을 수 없습니다.", {
            centerIndex,
            itemIndex,
            prevState,
            prevStates,
          });
        }

        const state = calcElementState({
          centerIndex,
          elementIndex: itemIndex,
          itemSize: item?.getBoundingClientRect() ?? { height: 0, width: 0 },
          prevState,
        });

        return {
          ...state,
          // isJumping이면 애니메이션 비활성화
          enableAnimation: enableAnimation && state.enableAnimation,
          // originPoint도 point와 동일하게 설정
          originPoint: state.point,
        };
      });
    },
    [calcElementState]
  );

  /**
   * - 페이지를 기준으로 element 의 상태를 업데이트 합니다.
   * - currentIndex 도 함께 업데이트 합니다.
   */
  const updateStateByPageIndex = useCallback(
    async ({
      centerIndex,
      withAnimate = true,
    }: {
      centerIndex: number;
      withAnimate?: boolean;
    }) => {
      setEnableScrollAnimator(withAnimate);
      setSliderInfo((prev) => ({
        ...prev,
        currentIndex: centerIndex,
        elementStates: getNewStatesByItems({
          centerIndex,
          enableAnimation: withAnimate,
          itemIndexs: prev.elementStates.map((_, index) => index),
          prevStates: prev.elementStates,
        }),
      }));

      if (withAnimate) {
        await startAnimateCheck();
      } else {
        stopAnimateCheck();
      }
    },
    [getNewStatesByItems, startAnimateCheck, stopAnimateCheck]
  );

  /**
   * - 포인터 드래그에 의해 레이아웃을 조정합니다.
   * - 뷰포트에 보여질 엘리먼트만 영향을 받습니다. (visibleCount 기준)
   */
  const updateStateByDrag = useCallback(
    (diff: Point2D) => {
      setSliderInfo((prev) => {
        const { currentIndex } = prev;
        const { length } = extendedItems;

        // visibleCount 기준으로 좌/우 인덱스들 계산
        // visibleCount=1: 좌1 + 중앙 + 우1 = 3개
        // visibleCount=2: 좌2 + 중앙 + 우2 = 5개
        const targetIndexes: number[] = [currentIndex];

        for (let i = 1; i <= visibleCount + 1; i++) {
          targetIndexes.push((currentIndex - i + length) % length); // 왼쪽
          targetIndexes.push((currentIndex + i) % length); // 오른쪽
        }

        const newElementStates = [...prev.elementStates];

        for (const targetIndex of targetIndexes) {
          const state = newElementStates[targetIndex];
          if (state) {
            const newPoint = addPoint(state.originPoint, { x: diff.x, y: 0 });

            // transition 계산: 아이템 너비 기준
            const item = elementInfos.current.get(targetIndex)?.item;
            if (item) {
              const { width } = item.getBoundingClientRect();
              const itemWidth = width + gap;
              const transition = Math.min(
                1,
                Math.max(0, Math.abs(newPoint.x) / itemWidth)
              );

              newElementStates[targetIndex] = {
                ...state,
                enableAnimation: false,
                point: newPoint,
                transition,
              };
            }
          }
        }

        return {
          ...prev,
          elementStates: newElementStates,
        };
      });
    },
    [extendedItems, gap, visibleCount]
  );

  const doNext = useCallback(() => {
    setSliderInfo((prev) => {
      const newIndex = (prev.currentIndex + 1) % extendedItems.length;
      return { ...prev, currentIndex: newIndex };
    });
  }, [extendedItems.length]);

  const doPrev = useCallback(() => {
    setSliderInfo((prev) => {
      const newIndex =
        (prev.currentIndex - 1 + extendedItems.length) % extendedItems.length;
      return { ...prev, currentIndex: newIndex };
    });
  }, [extendedItems.length]);

  /**
   * - extendedItems 프롭스에 의한 값을 초기화 합니다.
   */
  useLayoutEffect(() => {
    setSliderInfo((prevSliderInfo) => {
      return {
        ...prevSliderInfo,
        elementStates: getNewStatesByItems({
          centerIndex: prevSliderInfo.currentIndex,
          itemIndexs: extendedItems.map((_, index) => index),
          prevStates: prevSliderInfo.elementStates,
        }),
      };
    });
  }, [calcElementState, extendedItems, getNewStatesByItems]);

  /**
   * - 첫로드 또는 리사이즈 이벤트가 실행되면, 초기 높이와 위치를 초기화 합니다.
   */
  useLayoutEffect(() => {
    const handleResize = () => {
      requestAnimationFrame(() => {
        if (!wrapRef.current) {
          console.error("Slider 필수 요소에 접근할 수 없습니다.");
          return;
        }

        // 높이, 드래그 임계값 계산
        let estimatedHeight = 0;
        let estimatedScrollThreshold = 0;
        if (estimateSizeFromEveryElements) {
          for (const [, { content }] of elementInfos.current) {
            if (content) {
              const rect = content.getBoundingClientRect();
              const { height } = rect;
              if (height > estimatedHeight) {
                estimatedHeight = height;
              }
              if (rect.width > estimatedScrollThreshold) {
                estimatedScrollThreshold =
                  rect.width * CAN_SCROLL_THRESHOLD_RATIO;
              }
            }
          }
        } else {
          const firstElementInfo = elementInfos.current.get(0);
          const rect = firstElementInfo?.content?.getBoundingClientRect();
          estimatedHeight = rect?.height ?? 0;
          estimatedScrollThreshold =
            (rect?.width ?? DEFAULT_SCROLL_THRESHOLD) *
            CAN_SCROLL_THRESHOLD_RATIO;
        }

        wrapRef.current.style.height = `${estimatedHeight}px`;
        canScrollThreshold.current = estimatedScrollThreshold;

        // 아이템 위치 계산
        setSliderInfo((prevSliderInfo) => {
          return {
            ...prevSliderInfo,
            elementStates: getNewStatesByItems({
              centerIndex: prevSliderInfo.currentIndex,
              itemIndexs: prevSliderInfo.elementStates.map((_, index) => index),
              prevStates: prevSliderInfo.elementStates,
            }),
          };
        });
      });
    };

    // 초기 로드 시 높이 계산
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [calcElementState, estimateSizeFromEveryElements, getNewStatesByItems]);

  const handleSwipe = useCallback(async () => {
    lastSlideTriggerEvent.current = "swipe";
    await updateStateByPageIndex({
      centerIndex: sliderInfo.currentIndex,
      withAnimate: true,
    });
    lastSlideTriggerEvent.current = "pending";
  }, [sliderInfo.currentIndex, updateStateByPageIndex]);

  /**
   * - currentIndex 변경 시 애니메이션을 적용합니다.
   * - doNext/doPrev 또는 외부 index prop 변경 모두 처리합니다.
   */
  useLayoutEffect(() => {
    if (eventFromPropsChange.current) {
      eventFromPropsChange.current = false;
      return;
    }

    if (lastSliderInfoCurrentIndex.current !== sliderInfo.currentIndex) {
      lastSliderInfoCurrentIndex.current = sliderInfo.currentIndex;
      handleSwipe();
    }
  }, [sliderInfo.currentIndex, handleSwipe]);

  /**
   * - props index 변경을 업데이트 합니다.
   */
  const eventFromPropsChange = useRef(false);
  const lastIndex = useRef(index);
  useEffect(() => {
    if (
      lastSlideTriggerEvent.current !== "pending" ||
      lastIndex.current === index
    ) {
      return;
    }

    eventFromPropsChange.current = true;
    updateStateByPageIndex({
      centerIndex: index,
      withAnimate: false,
    });

    lastIndex.current = index;
  }, [index, updateStateByPageIndex]);

  /**
   * - currentIndex 변경 시 콜백을 호출합니다.
   * - 원본 인덱스로 변환하여 전달합니다.
   */
  useEffect(() => {
    if (
      prevCallbackIndex.current !== sliderInfo.currentIndex &&
      lastSlideTriggerEvent.current
    ) {
      // 원본 인덱스로 변환
      const originalIndex =
        items.length > 0 ? sliderInfo.currentIndex % items.length : 0;
      stableOnIndexChange(originalIndex, lastSlideTriggerEvent.current);
      prevCallbackIndex.current = sliderInfo.currentIndex;
    }
  }, [items.length, sliderInfo.currentIndex, stableOnIndexChange]);

  const { withPointerMove } = usePointerMove({
    enabled: enableDrag,
    target: wrapRef,
    onDraggingNow: (isDragging) => {
      setEnableScrollAnimator(!isDragging);
      onDraggingNow?.(isDragging);
    },
    onPointDrag: ({ isCancel, isEnd, transaction }) => {
      if (animateNow.current) {
        return;
      }

      const { primaryPointer } = transaction;

      /**
       * - 트랜잭션을 업데이트 합니다.
       */
      const calculate = primaryPointer?.calculate;
      if (calculate) {
        setEnableScrollAnimator(false);
        updateStateByDrag(calculate.diff);
        if (isEnd) {
          const diffX = Math.abs(calculate.diff.x);
          if (!isCancel && diffX > canScrollThreshold.current) {
            lastSlideTriggerEvent.current = "drag";
            if (calculate.diff.x < 0) {
              doNext();
            } else {
              doPrev();
            }
          } else {
            // 제자리로 움직이게 합니다.
            setSliderInfo((prev) => ({
              ...prev,
              elementStates: getNewStatesByItems({
                centerIndex: prev.currentIndex,
                enableAnimation: true,
                itemIndexs: prev.elementStates.map((_, index) => index),
                prevStates: prev.elementStates,
              }),
            }));
          }
        }
      }
    },
  });

  useAccessibilityHandler({
    target: wrapRef,
    handler: (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        doPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        doNext();
      }
    },
  });

  useImperativeHandle(
    ref,
    useCallback((): SliderRef => {
      return {
        doNext,
        doPrev,
        ...wrapRef.current!,
      };
    }, [doNext, doPrev])
  );

  return (
    <ul
      aria-roledescription="carousel"
      role="region"
      {...wrapProps}
      {...withPointerMove}
      className={["watcha-react-slider-wrap", wrapProps?.className].join(" ")}
      style={{
        ...wrapProps?.style,
        ...withPointerMove.style,
        touchAction: enableDrag ? "pan-y" : "none",
      }}>
      {extendedItems.map(({ extendedIndex, item, originalIndex }) => {
        const state: ElementState | undefined =
          sliderInfo.elementStates[extendedIndex];
        const isFocused = sliderInfo.currentIndex === extendedIndex;

        return (
          <SliderItemContextProvider
            key={`${onItemKey(item)}-${extendedIndex}`}
            immediate={!enableScrollAnimator}
            isFocused={isFocused}
            itemIndex={originalIndex}
            slideTriggerEvent={lastSlideTriggerEvent.current}
            transition={state ? state.transition : 0}>
            <li
              {...itemProps}
              ref={(element) => {
                updateElement({
                  elementInfo: { item: element },
                  index: extendedIndex,
                });
              }}
              aria-current={isFocused ? "true" : undefined}
              className={[
                "watcha-react-slider-item",
                itemProps?.className,
              ].join(" ")}
              style={
                state
                  ? {
                      transform: `translate3d(${state.point.x}px, ${state.point.y}px, 0px)`,
                      transition:
                        enableScrollAnimator && state.enableAnimation
                          ? `transform ${animationDuration}ms ${animationTimingFunction}`
                          : undefined,
                      zIndex: state.zIndex,
                    }
                  : undefined
              }>
              <div
                {...contentProps}
                ref={(element) => {
                  updateElement({
                    elementInfo: { content: element },
                    index: extendedIndex,
                  });
                }}
                className={[
                  "watcha-react-slider-content",
                  contentProps?.className,
                ].join(" ")}>
                {onCreateItemView(item, originalIndex)}
              </div>
            </li>
          </SliderItemContextProvider>
        );
      })}
    </ul>
  );
};

/**
 * # 루프 슬라이더 컴포넌트
 *
 * ## Element 구조
 * - wrap: 슬라이더를 감싸는 요소
 * - item: 슬라이더 하위의 아이템 요소
 * - content: 슬라이더 아이템 내부의 컨텐츠 요소 (높이영향)
 *
 * ## 아이템 복제 로직
 * 아이템 개수가 부족하면 자동으로 복제하여 자연스러운 루프를 구현합니다.
 *
 * ### 최소 필요 개수 (visibleCount=1 기준): 5개
 * - 좌측 (visibleCount + 1) = 2개 (보이는 1개 + 대기 1개)
 * - 중앙 = 1개
 * - 우측 (visibleCount + 1) = 2개 (보이는 1개 + 대기 1개)
 *
 * ### 아이템 갯수에 따른 복제 동작
 * - 5개 이상: 복제 없음, 원본 그대로(x1)
 * - 4개: 8개로 복제(x2)
 * - 3개: 6개로 복제(x2)
 * - 2개: 6개로 복제(x3)
 * - 1개: 5개로 복제(x5)
 */
export const Slider = forwardRef(SliderComponent) as <ItemType = unknown>(
  props: SliderProps<ItemType> & {
    ref?: React.ForwardedRef<HTMLUListElement>;
  }
) => React.ReactElement;

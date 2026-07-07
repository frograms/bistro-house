import "@packages/react-slider/src/resource/css/common/slider.css";

import { useSliderContext } from "@packages/react-slider/src/component/hook/use-slider-context";
import {
  Slider,
  type SliderRef,
} from "@packages/react-slider/src/component/view/slider";
import type { SlideTriggerEvent } from "@packages/react-slider/src/script/type/slider-types";
import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactSliderTransitionContainerCss } from "@playground/component/view/package/react-slider/_react-slider-transition-container.css";
import { reactSliderExampleCss } from "@playground/component/view/package/react-slider/_shared/react-slider-example.css";
import {
  SLIDER_ITEMS,
  type SliderItem,
} from "@playground/component/view/package/react-slider/_shared/react-slider-items";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";

type ReactSliderTransitionCardProps = {
  alphaStrength: number;
  item: SliderItem;
  scaleStrength: number;
};

const ALPHA_STRENGTH_OPTIONS = [0, 0.12, 0.24, 0.36, 0.48, 0.6] as const;
const GAP_OPTIONS = [0, 16, 32] as const;
const SCALE_STRENGTH_OPTIONS = [0, 0.04, 0.08, 0.12, 0.16, 0.2] as const;
const TRANSITION_CODE_EXAMPLE = `useSliderContext({
  onTransitionChange: (t, immediate) => {
    // t는 중앙 아이템과의 거리 비율입니다. 0이면 focus, 1이면 blur 상태입니다.
    setTransition(t);

    // immediate가 true면 초기 동기화처럼 CSS transition 없이 즉시 반영합니다.
    setEnableAnimation(!immediate);
  },
});

// t를 원하는 시각 값으로 변환해 카드 스타일에 연결합니다.
const alpha = 1 - transition * alphaStrength;
const scale = 1 - transition * scaleStrength;`;

const getTransitionScale = (transition: number, scaleStrength: number) => {
  return 1 - transition * scaleStrength;
};

const ReactSliderTransitionCard = ({
  alphaStrength,
  item,
  scaleStrength,
}: ReactSliderTransitionCardProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [transition, setTransition] = useState(1);
  const [enableAnimation, setEnableAnimation] = useState(false);

  useSliderContext({
    onBlur: () => {
      setIsFocused(false);
    },
    onFocus: () => {
      setIsFocused(true);
    },
    onInitialState: (focused) => {
      setIsFocused(focused);
      setTransition(focused ? 0 : 1);
      setEnableAnimation(false);
    },
    onTransitionChange: (nextTransition, immediate) => {
      setTransition(nextTransition);
      setEnableAnimation(!immediate);
    },
  });

  const alpha = 1 - transition * alphaStrength;
  const scale = getTransitionScale(transition, scaleStrength);

  return (
    <article
      className={[
        reactSliderExampleCss.card,
        reactSliderExampleCss.cardWithShadow,
        reactSliderTransitionContainerCss.transitionCard,
      ].join(" ")}
      style={
        {
          "--slider-card-accent": item.accentColor,
          "--slider-card-gradient": item.gradient,
          "--slider-card-opacity": alpha,
          "--slider-card-scale": scale,
          "--slider-dim-opacity": transition,
          "--slider-transition-duration": enableAnimation ? "500ms" : "0ms",
        } as CSSProperties
      }>
      <div className={reactSliderExampleCss.cardContent}>
        <span>{isFocused ? "focused" : "transition"}</span>
        <h3>{item.title}</h3>
        <p>
          t {transition.toFixed(2)} / scale {scale.toFixed(2)} / alpha{" "}
          {alpha.toFixed(2)}
        </p>
      </div>
      <div
        aria-hidden="true"
        className={reactSliderTransitionContainerCss.transitionDim}
      />
    </article>
  );
};

export const ReactSliderTransitionContainer = () => {
  const slider = useRef<SliderRef>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [alphaStrength, setAlphaStrength] =
    useState<(typeof ALPHA_STRENGTH_OPTIONS)[number]>(0.24);
  const [gap, setGap] = useState<(typeof GAP_OPTIONS)[number]>(16);
  const [lastTriggerEvent, setLastTriggerEvent] =
    useState<SlideTriggerEvent>("pending");
  const [scaleStrength, setScaleStrength] =
    useState<(typeof SCALE_STRENGTH_OPTIONS)[number]>(0.08);

  const handlePrevClick = useCallback(() => {
    slider.current?.doPrev();
  }, []);

  const handleNextClick = useCallback(() => {
    slider.current?.doNext();
  }, []);

  const handleSlideToClick = useCallback((index: number) => {
    slider.current?.doSlideTo(index);
  }, []);

  const handleIndexChange = useCallback(
    (newIndex: number, cause: SlideTriggerEvent) => {
      setCurrentIndex(newIndex);
      setLastTriggerEvent(cause);
    },
    []
  );

  const handleCreateItemView = useCallback(
    (item: SliderItem) => {
      return (
        <ReactSliderTransitionCard
          alphaStrength={alphaStrength}
          item={item}
          scaleStrength={scaleStrength}
        />
      );
    },
    [alphaStrength, scaleStrength]
  );

  const handleItemKey = useCallback((item: SliderItem) => item.id, []);

  return (
    <CommonContainer>
      <CommonNote
        items={[
          "이 패키지에서 제공하는 Slider 컴포넌트는 한 번에 하나의 아이템을 슬라이드하는 기본 흐름에 맞춰져 있습니다. 아이템 너비를 직접 지정하지 말고, 슬라이더 컨테이너 기준으로 렌더링되도록 두세요.",
        ]}
      />

      <section className={reactSliderExampleCss.exampleBlock}>
        <CommonExampleControlPanel>
          <div className={commonExampleControlsCss.controlGroup}>
            <button type="button" onClick={handlePrevClick}>
              이전 카드
            </button>
            <button type="button" onClick={handleNextClick}>
              다음 카드
            </button>
          </div>

          <div className={commonExampleControlsCss.controlGroup}>
            <span>인덱스로 이동</span>
            {SLIDER_ITEMS.map((item, index) => (
              <button
                key={item.id}
                disabled={currentIndex === index}
                type="button"
                onClick={() => {
                  handleSlideToClick(index);
                }}>
                {index}
              </button>
            ))}
          </div>

          <label className={commonExampleControlsCss.checkboxField}>
            <span>카드 간격</span>
            <select
              aria-label="카드 간격"
              value={gap}
              onChange={(event) => {
                setGap(Number(event.target.value) as typeof gap);
              }}>
              {GAP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}px
                </option>
              ))}
            </select>
          </label>

          <label className={commonExampleControlsCss.checkboxField}>
            <span>알파 강도</span>
            <select
              aria-label="알파 강도"
              value={alphaStrength}
              onChange={(event) => {
                setAlphaStrength(
                  Number(event.target.value) as typeof alphaStrength
                );
              }}>
              {ALPHA_STRENGTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={commonExampleControlsCss.checkboxField}>
            <span>스케일 강도</span>
            <select
              aria-label="스케일 강도"
              value={scaleStrength}
              onChange={(event) => {
                setScaleStrength(
                  Number(event.target.value) as typeof scaleStrength
                );
              }}>
              {SCALE_STRENGTH_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </CommonExampleControlPanel>

        <CommonExampleStagePanel
          className={reactSliderExampleCss.stage}>
          <Slider
            ref={slider}
            animationDuration={500}
            gap={gap}
            items={SLIDER_ITEMS}
            visibleCount={1}
            onCreateItemView={handleCreateItemView}
            onIndexChange={handleIndexChange}
            onItemKey={handleItemKey}
          />
        </CommonExampleStagePanel>

        <CommonExampleStatePanel
          items={[
            { label: "현재 인덱스", value: currentIndex },
            { label: "마지막 이동 원인", value: lastTriggerEvent },
            { label: "카드 간격", value: `${gap}px` },
            { label: "알파 강도", value: alphaStrength },
            { label: "스케일 강도", value: scaleStrength },
          ]}
        />
      </section>

      <CommonCodeBlock code={TRANSITION_CODE_EXAMPLE} />
    </CommonContainer>
  );
};

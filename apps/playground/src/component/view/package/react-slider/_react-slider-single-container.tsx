import "@packages/react-slider/src/resource/css/common/slider.css";

import {
  Slider,
  type SliderRef,
} from "@packages/react-slider/src/component/view/slider";
import type { SlideTriggerEvent } from "@packages/react-slider/src/script/type/slider-types";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactSliderExampleCss } from "@playground/component/view/package/react-slider/_shared/react-slider-example.css";
import {
  SLIDER_ITEMS,
  type SliderItem,
} from "@playground/component/view/package/react-slider/_shared/react-slider-items";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";

const GAP_OPTIONS = [0, 16, 32] as const;

export const ReactSliderSingleContainer = () => {
  const slider = useRef<SliderRef>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [enableDrag, setEnableDrag] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [lastTriggerEvent, setLastTriggerEvent] =
    useState<SlideTriggerEvent>("pending");
  const [gap, setGap] = useState<(typeof GAP_OPTIONS)[number]>(16);

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

  const handleCreateItemView = useCallback((item: SliderItem) => {
    return (
      <article
        className={reactSliderExampleCss.card}
        style={
          {
            "--slider-card-accent": item.accentColor,
            "--slider-card-gradient": item.gradient,
          } as CSSProperties
        }>
        <div className={reactSliderExampleCss.cardContent}>
          <span>{item.number}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </article>
    );
  }, []);

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

          <label>
            <input
              checked={enableDrag}
              type="checkbox"
              onChange={(event) => {
                setEnableDrag(event.target.checked);
              }}
            />
            <span>드래그 허용</span>
          </label>
        </CommonExampleControlPanel>

        <CommonExampleStagePanel className={reactSliderExampleCss.stage}>
          <Slider
            ref={slider}
            animationDuration={500}
            enableDrag={enableDrag}
            gap={gap}
            items={SLIDER_ITEMS}
            overflow="hidden"
            visibleCount={1}
            onCreateItemView={handleCreateItemView}
            onDraggingNow={setIsDragging}
            onIndexChange={handleIndexChange}
            onItemKey={handleItemKey}
          />
        </CommonExampleStagePanel>

        <CommonExampleStatePanel
          items={[
            { label: "현재 인덱스", value: currentIndex },
            { label: "마지막 이동 원인", value: lastTriggerEvent },
            { label: "드래그 중", value: isDragging ? "true" : "false" },
          ]}
        />
      </section>
    </CommonContainer>
  );
};

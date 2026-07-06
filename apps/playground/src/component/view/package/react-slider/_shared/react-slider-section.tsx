import {
  Slider,
  type SliderRef,
} from "@packages/react-slider/src/component/view/slider";
import type { SlideTriggerEvent } from "@packages/react-slider/src/script/type/slider-types";
import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import {
  CommonExampleControlPanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactSliderSectionCss } from "@playground/component/view/package/react-slider/_shared/react-slider-section.css";
import type { CSSProperties, ReactNode } from "react";
import { useCallback, useRef, useState } from "react";

type SliderItem = {
  accentColor: string;
  description: string;
  gradient: string;
  id: string;
  number: string;
  title: string;
};

const SLIDER_ITEMS: Array<SliderItem> = [
  {
    accentColor: "#f59e0b",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    gradient: "linear-gradient(135deg, #111827, #312e81)",
    id: "slider-item-1",
    number: "01",
    title: "Item 1",
  },
  {
    accentColor: "#10b981",
    description: "Sed do eiusmod tempor incididunt ut labore et dolore.",
    gradient: "linear-gradient(135deg, #064e3b, #0f766e)",
    id: "slider-item-2",
    number: "02",
    title: "Item 2",
  },
  {
    accentColor: "#3b82f6",
    description: "Ut enim ad minim veniam, quis nostrud exercitation.",
    gradient: "linear-gradient(135deg, #1e3a8a, #0284c7)",
    id: "slider-item-3",
    number: "03",
    title: "Item 3",
  },
  {
    accentColor: "#8b5cf6",
    description: "Duis aute irure dolor in reprehenderit in voluptate.",
    gradient: "linear-gradient(135deg, #4c1d95, #7c3aed)",
    id: "slider-item-4",
    number: "04",
    title: "Item 4",
  },
  {
    accentColor: "#ec4899",
    description: "Excepteur sint occaecat cupidatat non proident.",
    gradient: "linear-gradient(135deg, #831843, #db2777)",
    id: "slider-item-5",
    number: "05",
    title: "Item 5",
  },
];

const GAP_OPTIONS = [0, 16, 32] as const;

type ReactSliderExampleProps = {
  cardClassName?: string;
  overflow?: "hidden" | "visible";
};

type ReactSliderExampleConfig = ReactSliderExampleProps & {
  notes?: Array<ReactNode>;
};

type ReactSliderSectionProps = {
  variant: "peek" | "single";
};

const ReactSliderExample = ({
  cardClassName,
  overflow,
}: ReactSliderExampleProps) => {
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
        className={[reactSliderSectionCss.card, cardClassName]
          .filter(Boolean)
          .join(" ")}
        style={
          {
            "--slider-card-accent": item.accentColor,
            "--slider-card-gradient": item.gradient,
          } as CSSProperties
        }>
        <div className={reactSliderSectionCss.cardContent}>
          <span>{item.number}</span>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      </article>
    );
  }, [cardClassName]);

  const handleItemKey = useCallback((item: SliderItem) => item.id, []);

  return (
    <section className={reactSliderSectionCss.exampleBlock}>
      <CommonExampleControlPanel>
        <div className={commonExampleCss.buttonGroup}>
          <button type="button" onClick={handlePrevClick}>
            이전 카드
          </button>
          <button type="button" onClick={handleNextClick}>
            다음 카드
          </button>
        </div>

        <label>
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

        <label className={commonExampleCss.checkboxField}>
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

      <div
        className={[
          commonExampleCss.exampleStage,
          reactSliderSectionCss.stage,
        ].join(" ")}>
        <Slider
          ref={slider}
          animationDuration={500}
          enableDrag={enableDrag}
          gap={gap}
          items={SLIDER_ITEMS}
          overflow={overflow}
          visibleCount={1}
          onCreateItemView={handleCreateItemView}
          onDraggingNow={setIsDragging}
          onIndexChange={handleIndexChange}
          onItemKey={handleItemKey}
        />
      </div>

      <CommonExampleStatePanel
        items={[
          { label: "현재 인덱스", value: currentIndex },
          { label: "마지막 이동 원인", value: lastTriggerEvent },
          { label: "드래그 중", value: isDragging ? "true" : "false" },
        ]}
      />
    </section>
  );
};

const REACT_SLIDER_EXAMPLE_BY_VARIANT: Record<
  ReactSliderSectionProps["variant"],
  ReactSliderExampleConfig
> = {
  peek: {
    cardClassName: reactSliderSectionCss.cardWithShadow,
    notes: [
      "현재 아이템을 중심으로 양옆 아이템이 살짝 보이도록 노출하는 구성입니다.",
    ],
  },
  single: {
    overflow: "hidden",
  },
};

export const ReactSliderSection = ({ variant }: ReactSliderSectionProps) => {
  const example = REACT_SLIDER_EXAMPLE_BY_VARIANT[variant];
  const notes = [
    "이 패키지에서 제공하는 Slider 컴포넌트는 한 번에 하나의 아이템을 슬라이드하는 기본 흐름에 맞춰져 있습니다. 아이템 너비를 직접 지정하지 말고, 슬라이더 컨테이너 기준으로 렌더링되도록 두세요.",
    ...(example.notes ?? []),
  ];

  return (
    <section className={commonExampleCss.exampleSection}>
      <CommonNote items={notes} />

      <ReactSliderExample
        cardClassName={example.cardClassName}
        overflow={example.overflow}
      />
    </section>
  );
};

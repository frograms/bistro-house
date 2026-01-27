# @watcha-authentic/react-slider

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-slider)](https://www.npmjs.com/package/@watcha-authentic/react-slider)

리액트기반 슬라이더 컴포넌트입니다. 드래그/스와이프, 키보드 네비게이션을 지원하며 무한 루프 슬라이더를 제공합니다.

## 피어 종속성

이 패키지는 다음 패키지들을 피어 종속성으로 요구합니다.

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## 설치

```bash
pnpm add @watcha-authentic/react-slider react@>=18.0.0 react-dom@>=18.0.0
```

## 사용 예

### 기본 사용

```tsx
import { Slider } from "@watcha-authentic/react-slider";
import "@watcha-authentic/react-slider/style.css";

const items = [
  { id: 1, title: "Item 1" },
  { id: 2, title: "Item 2" },
  { id: 3, title: "Item 3" },
];

function App() {
  return (
    <Slider
      items={items}
      onItemKey={(item) => item.id}
      onCreateItemView={(item) => <div>{item.title}</div>}
      onIndexChange={(newIndex, cause) =>
        console.log("Index changed:", newIndex, cause)
      }
    />
  );
}
```

### Ref를 사용한 네비게이션

`ref`를 통해 `doNext()`와 `doPrev()` 메서드를 사용하여 슬라이더를 제어할 수 있습니다.

```tsx
import { Slider, type SliderRef } from "@watcha-authentic/react-slider";
import { useRef } from "react";

function App() {
  const sliderRef = useRef<SliderRef>(null);

  const handlePrev = () => {
    sliderRef.current?.doPrev();
  };

  const handleNext = () => {
    sliderRef.current?.doNext();
  };

  return (
    <>
      <button onClick={handlePrev}>Previous</button>
      <button onClick={handleNext}>Next</button>
      <Slider
        ref={sliderRef}
        items={items}
        onItemKey={(item) => item.id}
        onCreateItemView={(item) => <div>{item.title}</div>}
        defaultIndex={0}
      />
    </>
  );
}
```

### 스타일 import

CSS 스타일을 import하여 사용할 수 있습니다:

```tsx
import "@watcha-authentic/react-slider/style.css";
```

### Context 사용

아이템 내부에서 슬라이더 컨텍스트를 사용하여 포커스 상태나 전환 애니메이션을 처리할 수 있습니다.

```tsx
import { Slider, useSliderContext } from "@watcha-authentic/react-slider";

function CustomItem({ item }: { item: { id: number; title: string } }) {
  useSliderContext({
    onFocus: (isAutoSlide) => {
      console.log("Item focused", isAutoSlide);
    },
    onBlur: () => {
      console.log("Item blurred");
    },
    onTransitionChange: (t, immediate) => {
      // t: 0 ~ 1 사이의 값 (0: fade in, 1: fade out)
      // immediate: true면 실시간 값 변경, false면 애니메이션 트리거 가능
    },
  });

  return <div>{item.title}</div>;
}

function App() {
  return (
    <Slider
      items={items}
      onItemKey={(item) => item.id}
      onCreateItemView={(item) => <CustomItem item={item} />}
    />
  );
}
```

## 주요 Props

### `defaultIndex?: number`

- 초기 인덱스를 설정합니다.
- 기본값은 `0`입니다.
- **참고**: `index` prop은 제거되었습니다. 슬라이더 제어는 `ref`의 `doNext()`와 `doPrev()` 메서드를 사용하거나 `onIndexChange` 콜백을 통해 처리하세요.

### `ref: React.Ref<SliderRef>`

- `SliderRef` 타입의 ref를 전달하면 다음 메서드에 접근할 수 있습니다:
  - `doNext()`: 다음 슬라이드로 이동
  - `doPrev()`: 이전 슬라이드로 이동
- 또한 `HTMLUListElement`의 모든 속성과 메서드도 사용할 수 있습니다.

### `onIndexChange?: (newIndex: number, cause: SlideTriggerEvent) => void`

- 인덱스가 변경될 때 호출되는 콜백입니다.
- `cause`: 슬라이드 원인 (`'swipe'`: 키보드 네비게이션, `'drag'`: 드래그/스와이프, `'pending'`: 초기 상태)

### 기타 Props

- `items`: 슬라이더에 표시할 아이템 배열
- `onCreateItemView`: 각 아이템을 렌더링하는 함수
- `onItemKey`: 각 아이템의 고유 키를 반환하는 함수
- `animationDuration`: 애니메이션 지속 시간 (기본값: 500ms)
- `enableDrag`: 드래그 기능 활성화 여부 (기본값: true)
- `visibleCount`: 중앙 기준 좌우로 보여줄 요소 개수 (기본값: 1)

# @watcha-authentic/react-slider

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-slider)](https://www.npmjs.com/package/@watcha-authentic/react-slider)

React용 슬라이더 컴포넌트입니다. 드래그·스와이프, 키보드 탐색, 무한 루프를 지원합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-slider)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Main props](#main-props)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@watcha-authentic/react-a11y`
- `@watcha-authentic/react-event-callback`
- `@watcha-authentic/react-motion`

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

스타일은 `@watcha-authentic/react-slider/style.css` 경로로 import할 수 있습니다.

## Installation

```bash
pnpm add @watcha-authentic/react-slider react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

### Basic usage

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

### Navigation with ref

`ref`로 `doNext()`, `doPrev()`를 호출해 슬라이드를 넘길 수 있습니다.

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

### Importing styles

```tsx
import "@watcha-authentic/react-slider/style.css";
```

### Using context

아이템 안에서 슬라이더 컨텍스트로 포커스·전환 애니메이션을 다룰 수 있습니다.

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
      // t: 0 ~ 1 (0: fade in, 1: fade out)
      // immediate: true면 실시간, false면 애니메이션 가능
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

## Main props

### defaultIndex

- 처음 보여 줄 슬라이드 인덱스입니다.
- 기본값은 `0`입니다.
- **참고**: `index` prop은 없습니다. 슬라이드 이동은 `ref`의 `doNext()` / `doPrev()` 또는 `onIndexChange`로 처리하세요.

### ref and SliderRef

- `SliderRef` ref를 넘기면 아래 메서드를 쓸 수 있습니다.
  - `doNext()`: 다음 슬라이드
  - `doPrev()`: 이전 슬라이드
- `HTMLUListElement`의 속성·메서드도 그대로 사용할 수 있습니다.

### onIndexChange

- 슬라이드가 바뀔 때 호출됩니다.
- `cause`: `'swipe'` (키보드), `'drag'` (드래그·스와이프), `'pending'` (초기 상태)

### Other props

- `items`: 슬라이드에 넣을 아이템 배열
- `onCreateItemView`: 각 아이템을 그리는 함수
- `onItemKey`: 각 아이템의 고유 key
- `animationDuration`: 애니메이션 길이 (기본 500ms)
- `enableDrag`: 드래그 사용 여부 (기본 true)
- `visibleCount`: 중앙 기준 좌우로 보여 줄 개수 (기본 1)

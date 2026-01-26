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
      onIndexChange={(newIndex) => console.log("Index changed:", newIndex)}
    />
  );
}
```

### 스타일 import

CSS 스타일을 import하여 사용할 수 있습니다:

```tsx
import "@watcha-authentic/react-slider/style.css";
```

### Context 사용

```tsx
import {
  Slider,
  SliderContextProvider,
  useSliderContext,
} from "@watcha-authentic/react-slider";

function CustomNavigation() {
  const { currentIndex, goToIndex } = useSliderContext();

  return (
    <div>
      <button onClick={() => goToIndex(currentIndex - 1)}>Previous</button>
      <span>Current: {currentIndex}</span>
      <button onClick={() => goToIndex(currentIndex + 1)}>Next</button>
    </div>
  );
}

function App() {
  return (
    <SliderContextProvider>
      <Slider items={items} onItemKey={(item) => item.id} onCreateItemView={(item) => <div>{item.title}</div>} />
      <CustomNavigation />
    </SliderContextProvider>
  );
}
```

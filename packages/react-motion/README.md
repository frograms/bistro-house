# @watcha-authentic/react-motion

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-motion)](https://www.npmjs.com/package/@watcha-authentic/react-motion)

리액트기반 포인터 기반 이벤트의 모션, 제스쳐 핸들링 패키지입니다. 마우스, 터치 이벤트를 통합하여 포인터 이벤트를 처리하고 드래그, 스와이프 등의 제스쳐를 지원합니다.

## 피어 종속성

이 패키지는 다음 패키지들을 피어 종속성으로 요구합니다.

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## 설치

```bash
pnpm add @watcha-authentic/react-motion react@>=18.0.0 react-dom@>=18.0.0
```

## 사용 예

### 기본 사용

```tsx
import { usePointerMove } from "@watcha-authentic/react-motion";
import { useRef } from "react";

function App() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { pointerEvents, style } = usePointerMove({
    target: targetRef,
    onMove: (data) => {
      console.log("Pointer moved:", data);
    },
    onMoveStart: (data) => {
      console.log("Pointer move started:", data);
    },
    onMoveEnd: (data) => {
      console.log("Pointer move ended:", data);
    },
  });

  return (
    <div
      ref={targetRef}
      style={style}
      {...pointerEvents}
    >
      Drag me!
    </div>
  );
}
```

### 전역 포인터 이벤트

```tsx
import { usePointerMoveGlobal } from "@watcha-authentic/react-motion";

function App() {
  const { pointerEvents } = usePointerMoveGlobal({
    onMove: (data) => {
      console.log("Global pointer moved:", data);
    },
  });

  return <div {...pointerEvents}>Track global pointer</div>;
}
```

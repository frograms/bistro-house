# @watcha-authentic/react-motion

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-motion)](https://www.npmjs.com/package/@watcha-authentic/react-motion)

리액트기반 포인터 기반 이벤트의 모션, 제스쳐 핸들링 패키지입니다. 마우스, 터치 이벤트를 통합하여 포인터 이벤트를 처리하고 드래그, 스와이프 등의 제스쳐를 지원합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-motion)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

패키지 설치 시 함께 설치됩니다.

- `@watcha-authentic/react-event-callback`

### Peer dependencies

**호스트 프로젝트에 반드시 설치**해야 합니다.

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

```bash
pnpm add @watcha-authentic/react-motion react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

`src/index.ts`에서 `usePointerMove`, `usePointerMoveGlobal`, 포인터/수학 유틸 및 타입을 노출합니다.

### Basic usage (usePointerMove)

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

### Global pointer (usePointerMoveGlobal)

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

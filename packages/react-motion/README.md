# @watcha-authentic/react-motion

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-motion)](https://www.npmjs.com/package/@watcha-authentic/react-motion)

React에서 마우스·터치·포인터 이벤트와 드래그·스와이프 제스처를 다루는 훅과 유틸입니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-motion)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@watcha-authentic/react-event-callback`

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

```bash
pnpm add @watcha-authentic/react-motion react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

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
    <div ref={targetRef} style={style} {...pointerEvents}>
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

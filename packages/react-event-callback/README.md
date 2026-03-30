# @watcha-authentic/react-event-callback

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-event-callback)](https://www.npmjs.com/package/@watcha-authentic/react-event-callback)

리액트에서 동작되는 이벤트 콜백 디펜던시 유지 패키지입니다. 항상 최신 callback을 참조하면서 dependency 변경으로 인한 재실행을 방지하는 훅을 제공합니다.

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

이 패키지는 npm 기준 **런타임 `dependencies`가 없습니다.** 번들에 포함되는 외부 라이브러리는 없습니다.

### Peer dependencies

**이 패키지를 쓰는 호스트 앱(프로젝트)에 아래 패키지가 반드시 설치되어 있어야 합니다.** 미설치 시 런타임/타입 오류가 날 수 있습니다.

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

```bash
pnpm add @watcha-authentic/react-event-callback react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

`src/index.ts`에서 `useEventCallback`을 노출합니다.

### Basic usage

```tsx
import { useEventCallback } from "@watcha-authentic/react-event-callback";
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const handleClick = useEventCallback((value: number) => {
    console.log(count); // 항상 최신 count가 참조됨
    console.log(value);
  });

  useEffect(() => {
    someLib.on("event", handleClick);
    return () => {
      someLib.off("event", handleClick);
    };
  }, [handleClick]); // dependency 변경으로 인한 effect 재실행이 방지됨

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => handleClick(42)}>Call handler</button>
    </div>
  );
}
```

# @watcha-authentic/react-event-callback

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-event-callback)](https://www.npmjs.com/package/@watcha-authentic/react-event-callback)

`useEffect` 등에서 콜백 참조가 바뀌어도 effect가 다시 돌지 않게 하면서, 항상 최신 콜백을 쓸 수 있게 해 주는 React 훅입니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-event-callback)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

**없습니다.** 번들에 추가되는 외부 라이브러리가 없습니다.

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.** 빠져 있으면 타입·런타임 오류가 날 수 있습니다.

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

```bash
pnpm add @watcha-authentic/react-event-callback react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

### Basic usage

```tsx
import { useEventCallback } from "@watcha-authentic/react-event-callback";
import { useEffect, useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const handleClick = useEventCallback((value: number) => {
    console.log(count); // 항상 최신 count
    console.log(value);
  });

  useEffect(() => {
    someLib.on("event", handleClick);
    return () => {
      someLib.off("event", handleClick);
    };
  }, [handleClick]); // handleClick 참조가 바뀌어도 effect는 다시 실행되지 않음

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => handleClick(42)}>Call handler</button>
    </div>
  );
}
```

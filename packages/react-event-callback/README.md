# @watcha-authentic/react-event-callback

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-event-callback)](https://www.npmjs.com/package/@watcha-authentic/react-event-callback)

리액트에서 동작되는 이벤트 콜백 디펜던시 유지 패키지입니다. 항상 최신 callback을 참조하면서 dependency 변경으로 인한 재실행을 방지하는 훅을 제공합니다.

## 피어 종속성

이 패키지는 다음 패키지들을 피어 종속성으로 요구합니다.

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## 설치

```bash
pnpm add @watcha-authentic/react-event-callback react@>=18.0.0 react-dom@>=18.0.0
```

## 사용 예

### 기본 사용

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

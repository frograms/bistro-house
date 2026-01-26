# @watcha-authentic/react-a11y

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-a11y)](https://www.npmjs.com/package/@watcha-authentic/react-a11y)

리액트기반 접근성 관련 유틸 패키지입니다. 키보드 네비게이션 등 접근성 기능을 제공합니다.

## 피어 종속성

이 패키지는 다음 패키지들을 피어 종속성으로 요구합니다.

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## 설치

```bash
pnpm add @watcha-authentic/react-a11y react@>=18.0.0 react-dom@>=18.0.0
```

## 사용 예

### 기본 사용

```tsx
import { useAccessibilityHandler } from "@watcha-authentic/react-a11y";
import { useRef } from "react";

function App() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { enableAccessibility } = useAccessibilityHandler({
    target: targetRef,
    handler: (event) => {
      if (event.key === "Enter" || event.key === " ") {
        console.log("Activated!");
      }
    },
  });

  return (
    <div
      ref={targetRef}
      tabIndex={0}
      role="button"
      aria-label="Clickable element"
    >
      Accessible element
    </div>
  );
}
```

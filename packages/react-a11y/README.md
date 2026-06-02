# @watcha-authentic/react-a11y

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-a11y)](https://www.npmjs.com/package/@watcha-authentic/react-a11y)

리액트기반 접근성 관련 유틸 패키지입니다. 키보드 네비게이션 등 접근성 기능을 제공합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-a11y)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

`pnpm` / `npm`으로 이 패키지를 설치하면 아래 의존성은 **함께 설치**됩니다.

- `@watcha-authentic/react-event-callback` — 이벤트 핸들러 안정화용 훅

### Peer dependencies

**호스트 프로젝트에 반드시 직접 설치**해야 합니다. 버전은 프로젝트에 맞게 맞추세요.

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

```bash
pnpm add @watcha-authentic/react-a11y react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

`src/index.ts`에서 `useAccessibilityHandler` 및 타입을 노출합니다.

### Basic usage

```tsx
import { useAccessibilityHandler } from "@watcha-authentic/react-a11y";
import { useRef } from "react";

function App() {
  const targetRef = useRef<HTMLDivElement>(null);
  useAccessibilityHandler({
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

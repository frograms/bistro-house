# @watcha-authentic/react-a11y

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-a11y)](https://www.npmjs.com/package/@watcha-authentic/react-a11y)

React 앱에서 키보드 탐색 등 접근성 이벤트를 다루는 유틸리티입니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-a11y)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@watcha-authentic/react-event-callback` — 이벤트 핸들러를 안정적으로 유지하는 훅

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

```bash
pnpm add @watcha-authentic/react-a11y react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

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
      aria-label="Clickable element">
      Accessible element
    </div>
  );
}
```

# @watcha-authentic/react-isomorphic-layout-effect

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-isomorphic-layout-effect)](https://www.npmjs.com/package/@watcha-authentic/react-isomorphic-layout-effect)

브라우저에서는 `useLayoutEffect`, 서버에서는 `useEffect`를 쓰는 훅입니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-isomorphic-layout-effect)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Dependencies

### Runtime dependencies

런타임 dependencies가 없습니다.

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

### Install this package

```bash
pnpm add @watcha-authentic/react-isomorphic-layout-effect
```

### Install peer dependencies

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

### Basic usage

페인트 전에 DOM을 만져야 할 때 `useLayoutEffect` 대신 씁니다. 서버에서는 `useEffect`로 바뀌어 경고가 나지 않습니다.

```tsx
import { useIsomorphicLayoutEffect } from "@watcha-authentic/react-isomorphic-layout-effect";

const ThemeClass = ({ name }: { name: string }) => {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.add(name);
    return () => {
      document.documentElement.classList.remove(name);
    };
  }, [name]);

  return null;
};
```

## API

### useIsomorphicLayoutEffect

`useLayoutEffect`와 같은 시그니처입니다. 브라우저에서는 `useLayoutEffect`, 서버에서는 `useEffect`입니다.

#### Parameters

| Name     | Type             | Default | Description                                                        |
| -------- | ---------------- | ------- | ------------------------------------------------------------------ |
| `effect` | `EffectCallback` | —       | 마운트·의존성 변경 때 실행할 이펙트. cleanup을 반환할 수 있습니다. |
| `deps`   | `DependencyList` | —       | 이펙트를 다시 돌릴 의존성. 없으면 매 렌더 실행합니다.              |

#### Returns

| Name | Type   | Description        |
| ---- | ------ | ------------------ |
| —    | `void` | 반환값이 없습니다. |

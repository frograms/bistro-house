# @watcha-authentic/react-stable-ref-callback

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-stable-ref-callback)](https://www.npmjs.com/package/@watcha-authentic/react-stable-ref-callback)

callback ref 참조를 고정해, 리렌더마다 `null` → element 재호출로 observe·타이머 등이 리셋되지 않게 해 주는 React 훅입니다.

인라인 `ref={(node) => ...}`는 렌더마다 함수가 새로 만들어집니다. React는 이전 콜백에 `null`을 넣고 새 콜백에 element를 다시 넘기므로, ResizeObserver·IntersectionObserver·`setTimeout` 같은 구독이 detach/attach 때마다 끊겼다가 다시 붙습니다. 이 패키지는 ref 참조만 고정하고 콜백 본문만 최신으로 유지해, **노드는 그대로인데 리렌더만 난 경우**에는 콜백을 다시 부르지 않습니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-stable-ref-callback)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Dependencies

### Runtime dependencies

**없습니다.** 번들에 추가되는 외부 라이브러리가 없습니다.

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

### Install this package

```bash
pnpm add @watcha-authentic/react-stable-ref-callback
```

### Install peer dependencies

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

### Basic usage

`useStableRefCallback`로 만든 ref를 `ref` prop에 넘기고, `.current`로 노드를 읽습니다. 콜백 본문은 매 렌더 최신 값을 봅니다.

```tsx
import { useState } from "react";
import { useStableRefCallback } from "@watcha-authentic/react-stable-ref-callback";

function MeasureBox() {
  const [width, setWidth] = useState(0);

  const boxRef = useStableRefCallback<HTMLDivElement>((node) => {
    setWidth(node?.getBoundingClientRect().width ?? 0);
  });

  return (
    <div>
      <div ref={boxRef}>측정 대상</div>
      <p>width: {width}</p>
      <p>current: {boxRef.current?.tagName ?? "null"}</p>
    </div>
  );
}
```

### Avoiding null on re-render

인라인 callback ref는 리렌더마다 `null` → element가 이어져 observe/타이머가 리셋됩니다. `useStableRefCallback`은 참조가 고정되어 리렌더만으로는 재호출이 나지 않습니다. 노드가 그대로인데 콜백만 바뀌어도 다시 호출하지 않습니다.

```tsx
import { useState } from "react";
import { useStableRefCallback } from "@watcha-authentic/react-stable-ref-callback";

function CompareRefs() {
  const [tick, setTick] = useState(0);

  // ❌ 리렌더마다: null → element (구독이 끊겼다 다시 붙음)
  const inlineRef = (node: HTMLDivElement | null) => {
    console.log("inline", node);
  };

  // ✅ 리렌더해도: null 재호출 없음 (구독 유지)
  const stableRef = useStableRefCallback<HTMLDivElement>((node) => {
    console.log("stable", node);
  });

  return (
    <div>
      <button type="button" onClick={() => setTick((value) => value + 1)}>
        리렌더 ({tick})
      </button>
      <div ref={inlineRef}>inline</div>
      <div ref={stableRef}>stable</div>
    </div>
  );
}
```

## API

### useStableRefCallback

callback ref 참조를 고정하고, 콜백 본문만 최신으로 유지합니다. attach/detach 시에만 호출하며, 노드가 그대로인데 콜백만 바뀌면 다시 호출하지 않습니다.

#### Parameters

| Name       | Type                                           | Default | Description                                   |
| ---------- | ---------------------------------------------- | ------- | --------------------------------------------- |
| `callback` | `((instance: T \| null) => void) \| undefined` | —       | ref가 attach/detach될 때 호출. 생략하면 no-op |

#### Returns

| Name | Type                   | Description                                                                |
| ---- | ---------------------- | -------------------------------------------------------------------------- |
| —    | `StableRefCallback<T>` | `ref={...}`에 넘길 수 있는 안정적인 callback. `.current`로 노드를 읽습니다 |

### StableRefCallback

`useStableRefCallback`의 반환 타입입니다.

| Name      | Type                            | Default | Description                   |
| --------- | ------------------------------- | ------- | ----------------------------- |
| `(call)`  | `(instance: T \| null) => void` | —       | React가 호출하는 callback ref |
| `current` | `T \| null`                     | `null`  | 마지막으로 attach된 인스턴스  |

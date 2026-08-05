# @watcha-authentic/react-context-factory

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-context-factory)](https://www.npmjs.com/package/@watcha-authentic/react-context-factory)

React context를 타입 세이프하게 생성하는 팩토리 유틸입니다. `Context`, `Provider`, `Consumer`, `use` 훅을 한 번에 만들 수 있습니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-context-factory)

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
pnpm add @watcha-authentic/react-context-factory
```

### Install peer dependencies

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

### Basic usage

`createContext`에 넘긴 제네릭이 `Provider` props와 `use()` 반환 타입까지 이어집니다.

```tsx
import { useMemo, useState } from "react";
import { createContext } from "@watcha-authentic/react-context-factory";

type User = { id: string; displayName: string };

const UserContext = createContext<
  { user: User | null; setUser: (user: User | null) => void },
  { children: React.ReactNode; initialUser?: User }
>({
  providerComponent: ({ context }) => {
    const UserProvider = ({
      children,
      initialUser = null,
    }: {
      children: React.ReactNode;
      initialUser?: User | null;
    }) => {
      const [user, setUser] = useState<User | null>(initialUser);
      const value = useMemo(() => ({ user, setUser }), [user]);
      return <context.Provider value={value}>{children}</context.Provider>;
    };
    return UserProvider;
  },
});

function Greeting() {
  const { user, setUser } = UserContext.use();
  if (!user) {
    return (
      <button
        type="button"
        onClick={() => setUser({ id: "1", displayName: "게스트" })}>
        로그인
      </button>
    );
  }
  return <p>{user.displayName}님 안녕하세요</p>;
}

function App() {
  return (
    <UserContext.Provider initialUser={{ id: "1", displayName: "게스트" }}>
      <Greeting />
    </UserContext.Provider>
  );
}
```

### With custom hook

팩토리 반환값의 `use`를 감싸 도메인 훅으로 내보낼 수 있습니다. 반환 타입은 그대로 유지됩니다.

```tsx
export function useUser() {
  return UserContext.use();
}
```

### With Consumer

훅 대신 `Consumer`로 context 값을 받을 수도 있습니다.

```tsx
function UserLabel() {
  return (
    <UserContext.Consumer>
      {({ user }) => <span>{user?.displayName ?? "비로그인"}</span>}
    </UserContext.Consumer>
  );
}
```

## API

### createContext

Context, Provider, Consumer, `use` 훅을 한 번에 생성합니다.

#### Parameters

| Name   | Type   | Default | Description       |
| ------ | ------ | ------- | ----------------- |
| `args` | object | —       | 아래 Options 참고 |

#### Options

| Name                | Type                                                                                               | Default | Description                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `providerComponent` | `({ context }: CreateContextProviderArgs<ContextActions>) => (props: ContextProps) => JSX.Element` | —       | `context`를 받아 Provider 컴포넌트를 반환하는 팩토리. `ContextProps`는 최소한 `children?`를 가집니다 |

#### Returns

| Name       | Type                                   | Description                                    |
| ---------- | -------------------------------------- | ---------------------------------------------- |
| `Context`  | `React.Context<ContextActions>`        | 생성된 React context 객체                      |
| `Provider` | `(props: ContextProps) => JSX.Element` | `providerComponent`가 반환한 Provider 컴포넌트 |
| `Consumer` | `React.Consumer<ContextActions>`       | context Consumer                               |
| `use`      | `() => ContextActions`                 | context 값을 읽는 훅                           |

제네릭:

- `ContextActions` — context value 타입
- `ContextProps` — Provider props 타입 (`children?` 포함)

### CreateContextProviderArgs

`providerComponent`에 전달되는 인자 타입입니다.

| Name      | Type                            | Default | Description                                                                   |
| --------- | ------------------------------- | ------- | ----------------------------------------------------------------------------- |
| `context` | `React.Context<ContextActions>` | —       | 팩토리가 생성한 context. Provider 구현에서 `context.Provider`로 값을 넘깁니다 |

# @watcha-authentic/react-theme-context

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-theme-context)](https://www.npmjs.com/package/@watcha-authentic/react-theme-context)

테마 변경을 컨텍스트로 관리할 수 있는 컨텍스트입니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-theme-context)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@watcha-authentic/react-context-factory` `^1.1.0` — 테마 컨텍스트를 만들 때 사용합니다.
- `@watcha-authentic/react-event-callback` `^1.3.0` — `onThemeSelect`·`onResolveSystemTheme`·`setTheme` 참조를 안정적으로 유지합니다.
- `@watcha-authentic/react-isomorphic-layout-effect` `^1.1.0` — `onThemeSelect`을 브라우저에서는 페인트 전에, 서버에서는 경고 없이 호출합니다.

### Peer dependencies

**React와 React DOM은 프로젝트에 함께 설치해야 합니다.**

- `react` `>=18.0.0`
- `react-dom` `>=18.0.0`

## Installation

### Install this package

```bash
pnpm add @watcha-authentic/react-theme-context
```

### Install peer dependencies

```bash
pnpm add react@>=18.0.0 react-dom@>=18.0.0
```

## Usage

### Basic usage

`themes`와 `defaultTheme` 이름으로 테마를 읽고, `theme.name`은 전달한 테마 이름 타입을 따릅니다. `onResolveSystemTheme`은 항상 필요합니다.

```tsx
import { createThemeContext } from "@watcha-authentic/react-theme-context";

type ColorTokens = { background: string; color: string };

const lightTheme = {
  name: "light",
  value: { background: "#ffffff", color: "#111111" },
} as const;
const darkTheme = {
  name: "dark",
  value: { background: "#111111", color: "#ffffff" },
} as const;

const ThemeContext = createThemeContext<ColorTokens, "dark" | "light">();

const ThemeLabel = () => {
  const { theme } = ThemeContext.use();

  return <p>{theme.name}</p>;
};

export const App = () => {
  return (
    <ThemeContext.Provider
      defaultTheme="light"
      themes={[lightTheme, darkTheme]}
      onResolveSystemTheme={(appearance) => {
        return appearance ?? "light";
      }}>
      <ThemeLabel />
    </ThemeContext.Provider>
  );
};
```

### Changing a theme

`setTheme`은 `setState`처럼 테마 이름, `"system-appearance"`, 또는 이전 값을 받는 함수를 받습니다. 목록에 없는 이름이면 바꾸지 않습니다. `"system-appearance"`이면 `onResolveSystemTheme`으로 OS 어피어런스를 테마 이름으로 바꿉니다.

```tsx
const ThemeToggle = () => {
  const { setTheme, theme } = ThemeContext.use();

  return (
    <button
      type="button"
      onClick={() => {
        setTheme((prevThemeName) => {
          return prevThemeName === "dark" ? "light" : "dark";
        });
      }}>
      {theme.name}
    </button>
  );
};
```

### Following the system appearance

`onResolveSystemTheme`은 항상 필요합니다. `defaultTheme`이나 `setTheme`이 `"system-appearance"`이면 OS 라이트·다크, 또는 아직 모를 때의 `undefined`를 목록 테마 이름으로 바꿉니다. 그릴 때 호출되므로 이름만 반환하면 됩니다.

```tsx
<ThemeContext.Provider
  defaultTheme="system-appearance"
  themes={[lightTheme, darkTheme]}
  onResolveSystemTheme={(appearance) => {
    return appearance ?? "light";
  }}>
  <ThemeLabel />
</ThemeContext.Provider>
```

### Reading the system appearance

`useSystemAppearance`로 OS 라이트·다크를 구독합니다. 아직 모르면 `appearance`는 `undefined`입니다.

```tsx
import { useSystemAppearance } from "@watcha-authentic/react-theme-context";

const AppearanceLabel = () => {
  const { appearance } = useSystemAppearance();

  return <p>{appearance ?? "pending"}</p>;
};
```

### Applying the selected theme

테마 이름이 바뀌면 `onThemeSelect`가 선택된 테마와 직전 테마를 전달합니다. 클래스나 데이터 속성 반영은 이 콜백에서 처리합니다.

```tsx
<ThemeContext.Provider
  defaultTheme="light"
  themes={[lightTheme, darkTheme]}
  onResolveSystemTheme={(appearance) => {
    return appearance ?? "light";
  }}
  onThemeSelect={(selected, before) => {
    if (before !== undefined) {
      document.documentElement.classList.remove(before.name);
    }
    document.documentElement.classList.add(selected.name);
  }}>
  <ThemeLabel />
</ThemeContext.Provider>
```

### With Consumer

훅 대신 `Consumer`로 테마를 읽을 수 있습니다. `Context`는 같은 값을 가진 React context입니다.

```tsx
const ThemeName = () => {
  return (
    <ThemeContext.Consumer>
      {({ theme }) => <span>{theme.name}</span>}
    </ThemeContext.Consumer>
  );
};
```

## API

### createThemeContext

테마 컨텍스트를 만듭니다. 호출할 때마다 새 컨텍스트가 생기므로 모듈 스코프에서 한 번 호출합니다.

#### Parameters

없습니다. `ThemeValue`가 테마 값 타입이고, `ThemeName`이 테마 이름 타입입니다. `ThemeName`을 생략하면 `string`입니다.

#### Returns

| Name       | Type                                                                       | Description                                      |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------------ |
| `Provider` | `(props: ThemeContextProviderProps<ThemeValue, ThemeName>) => JSX.Element` | 테마 상태를 하위에 전달합니다. props는 아래 참고 |
| `use`      | `() => ThemeContextActions<ThemeValue, ThemeName>`                         | 테마 상태를 읽습니다                             |
| `Consumer` | `React.Consumer<ThemeContextActions<ThemeValue, ThemeName>>`               | 훅 대신 테마 상태를 읽습니다                     |
| `Context`  | `React.Context<ThemeContextActions<ThemeValue, ThemeName>>`                | `Provider`가 사용하는 React context              |

### ThemeContextProviderProps

`Provider` props 타입입니다.

| Name                   | Type                                                                                      | Default | Description                                                                                   |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `themes`               | `ReadonlyArray<Theme<ThemeValue, ThemeName>>`                                             | —       | 선택할 수 있는 테마 목록                                                                      |
| `defaultTheme`         | `ThemeName \| SystemAppearanceName`                                                       | —       | 처음 테마 이름. `"system-appearance"`이면 OS를 따릅니다                                       |
| `onResolveSystemTheme` | `(appearance: SystemAppearance \| undefined) => ThemeName`                                | —       | OS 어피어런스를 테마 이름으로 바꿉니다. 항상 필요합니다. 그릴 때 호출되므로 이름만 반환합니다 |
| `onThemeSelect`        | `(selected: Theme<ThemeValue, ThemeName>, before?: Theme<ThemeValue, ThemeName>) => void` | —       | 테마 이름이 바뀔 때 호출합니다. 첫 호출에는 `before`가 없습니다                               |
| `children`             | `ReactNode`                                                                               | —       | Provider 하위                                                                                 |

`onThemeSelect`는 클라이언트에서 호출됩니다. 서버 렌더 직후 첫 알림은 `defaultTheme`일 수 있습니다.

`onResolveSystemTheme`이 반환한 이름이 `themes`에 없으면 에러가 납니다.

### ThemeContextActions

`use`와 `Consumer`가 받는 값입니다.

| Name       | Type                                                          | Description                                                                          |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `theme`    | `Theme<ThemeValue, ThemeName>`                                | 지금 선택된 테마                                                                     |
| `setTheme` | `Dispatch<SetStateAction<ThemeName \| SystemAppearanceName>>` | 이름·`"system-appearance"` 또는 이전 값으로 바꿉니다. 목록에 없으면 바꾸지 않습니다. |

### useSystemAppearance

OS 색 테마를 구독합니다.

#### Parameters

없습니다.

#### Returns

| Name         | Type                            | Description                                   |
| ------------ | ------------------------------- | --------------------------------------------- |
| `appearance` | `SystemAppearance \| undefined` | OS 라이트·다크. 아직 모르면 `undefined`입니다 |

### SystemAppearanceState

`useSystemAppearance`가 반환하는 값입니다.

| Name         | Type                            | Default | Description                                   |
| ------------ | ------------------------------- | ------- | --------------------------------------------- |
| `appearance` | `SystemAppearance \| undefined` | —       | OS 라이트·다크. 아직 모르면 `undefined`입니다 |

### LightAppearanceName

`"light"`입니다.

`LIGHT_APPEARANCE_NAME`은 같은 값의 상수입니다.

### DarkAppearanceName

`"dark"`입니다.

`DARK_APPEARANCE_NAME`은 같은 값의 상수입니다.

### SystemAppearance

OS가 알려 주는 색 테마입니다. `"dark"` 또는 `"light"`입니다.

`DARK_APPEARANCE_NAME`, `LIGHT_APPEARANCE_NAME`은 같은 값의 상수입니다.

### SystemAppearanceName

`"system-appearance"`입니다. OS 어피어런스를 따를 때 `defaultTheme`과 `setTheme`에 넣습니다.

`SYSTEM_APPEARANCE_NAME`은 같은 값의 상수입니다.

### Theme

이름이 있는 테마입니다.

| Name    | Type         | Default | Description    |
| ------- | ------------ | ------- | -------------- |
| `name`  | `ThemeName`  | —       | 테마 이름      |
| `value` | `ThemeValue` | —       | 테마에 담긴 값 |

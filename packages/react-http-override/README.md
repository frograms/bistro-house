# @watcha-authentic/react-http-override

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-http-override)](https://www.npmjs.com/package/@watcha-authentic/react-http-override)

staging 환경에서 fetch 요청을 관찰하고 에러·지연·빈 상태를 시뮬레이션하는 devtools 패널입니다. SWR 앱을 1급으로 지원합니다.

`window.fetch`를 몽키패치하지 않습니다. 앱의 API 관문이 `(window.__HTTP_OVERRIDE__?.fetch ?? fetch)(url, init)` 한 줄로 자발적으로 위임하는 방식이라, devtools가 꺼져 있으면 원래 `fetch`가 그대로 쓰입니다.

엔트리는 2개입니다.

- `@watcha-authentic/react-http-override/core` — React 없이 동작하는 코어. 부팅 최상단에서 `installHttpOverride`로 설치합니다.
- `@watcha-authentic/react-http-override` — 런처 버튼·패널 등 React UI. 코어의 export도 함께 제공합니다.

릴리즈: [CHANGELOG](https://github.com/frograms/bistro-house/blob/master/packages/react-http-override/CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=react-http-override)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `use-sync-external-store` `^1.2.0` — React 17에서도 `useSyncExternalStore`를 쓰기 위한 shim입니다.

### Peer dependencies

**패널 UI를 쓴다면 React와 React DOM을 프로젝트에 함께 설치해야 합니다.** `/core` 엔트리만 쓴다면 React 없이도 동작하며, peer 의존성이 optional로 선언돼 있어 React 없는 프로젝트에서도 설치 경고가 나지 않습니다.

- `react` `>=17.0.0`
- `react-dom` `>=17.0.0`

## Installation

### Install this package

```bash
pnpm add @watcha-authentic/react-http-override
```

### Install peer dependencies

```bash
pnpm add react@>=17.0.0 react-dom@>=17.0.0
```

## Usage

### Basic usage

설치는 3단계입니다. 코어 설치 → API 관문 위임 → 런처 마운트.

1 — 부팅 최상단(엔트리 파일 가장 위)에서 코어를 설치합니다. SSR에서는 no-op이고, HMR로 다시 실행돼도 기존 설치를 재사용합니다. `enabled: false`면 아무것도 하지 않습니다.

```ts
import { installHttpOverride } from "@watcha-authentic/react-http-override/core";

installHttpOverride({ enabled: import.meta.env.MODE === "staging" });
```

2 — 앱의 API 관문에서 한 줄로 위임합니다. devtools가 설치되지 않았으면 원래 `fetch`를 씁니다.

```ts
const apiFetch = (url: string, init?: RequestInit) =>
  (window.__HTTP_OVERRIDE__?.fetch ?? fetch)(url, init);
```

3 — React UI(런처 버튼 + 패널)를 마운트합니다. staging에서만 쓰는 UI이므로 `React.lazy`로 청크를 분리하는 것을 권장합니다.

```tsx
import { lazy, Suspense } from "react";

const HttpOverrideLauncher = lazy(() =>
  import("@watcha-authentic/react-http-override").then((module) => ({
    default: module.HttpOverrideLauncher,
  }))
);

const App = () => (
  <>
    {/* ...앱... */}
    <Suspense fallback={null}>
      <HttpOverrideLauncher enabled={import.meta.env.MODE === "staging"} />
    </Suspense>
  </>
);
```

패널에서 만든 룰은 sessionStorage에 저장되어 새로고침해도 유지되고, 탭끼리는 격리됩니다. 런처 버튼은 브라우저 콘솔에서 `__HTTP_OVERRIDE__.show()` / `.hide()` / `.toggle()`로 표시·숨김을 제어할 수 있습니다.

### With SWR

`createSwrAdapter`에 `useSWRConfig()` 결과를 넘기면 패널의 Cache 탭에서 SWR 캐시를 보고 키별 재요청을 실행할 수 있습니다. 구조적 타이핑이라 이 패키지는 `swr`에 의존하지 않습니다.

```tsx
import {
  createSwrAdapter,
  HttpOverrideLauncher,
} from "@watcha-authentic/react-http-override";
import { useMemo } from "react";
import { useSWRConfig } from "swr";

const DevtoolsMount = () => {
  const { cache, mutate } = useSWRConfig();
  const { cacheAdapter, onRevalidate } = useMemo(
    () => createSwrAdapter({ cache, mutate }),
    [cache, mutate]
  );
  return (
    <HttpOverrideLauncher
      cacheAdapter={cacheAdapter}
      enabled
      onRevalidate={onRevalidate}
    />
  );
};
```

### Embedding other devtools with extraTabs

`extraTabs`로 패널에 탭을 추가할 수 있습니다. React Query devtools 패널처럼 다른 devtools를 같은 셸 안에 임베드하는 용도입니다.

```tsx
import {
  HttpOverrideLauncher,
  type HttpOverrideTab,
} from "@watcha-authentic/react-http-override";
import { lazy } from "react";

const ReactQueryPanel = lazy(() =>
  import("@tanstack/react-query-devtools").then((module) => ({
    default: module.ReactQueryHttpOverridePanel,
  }))
);

const extraTabs: HttpOverrideTab[] = [
  {
    key: "react-query",
    label: "React Query",
    render: () => <ReactQueryPanel />,
  },
];

const App = () => <HttpOverrideLauncher enabled extraTabs={extraTabs} />;
```

### Embedding the panel elsewhere

반대로 이 패널을 다른 devtools 셸 안에 꽂을 수도 있습니다. `HttpOverridePanel`은 런처 버튼·포털·고정 위치가 없는 임베더블 패널로, React Query의 `ReactQueryHttpOverridePanel`에 대응합니다. 열고 닫는 것은 감싸는 쪽이 담당합니다.

```tsx
import { HttpOverridePanel } from "@watcha-authentic/react-http-override";

const MyDevtoolsShell = () => (
  <aside>
    <HttpOverridePanel />
  </aside>
);
```

### Controlling rules programmatically

패널 UI 없이도 `window.__HTTP_OVERRIDE__`의 `rules`로 룰을 제어할 수 있습니다. `status`는 실제 요청 없이 목 응답을 반환하고, `delayMs`만 있으면 실제 응답을 지연 후 그대로 통과시키며, `patch`는 실제 응답 JSON에서 지정한 path의 값만 수정합니다. 같은 URL에 여러 룰이 매칭되면 서로 합성됩니다 — 자세한 규칙은 [HttpOverrideRule](#fetchdevtoolsrule)을 참고하세요.

```ts
const api = window.__HTTP_OVERRIDE__;

// 500 에러 목 응답
api?.rules.add({
  body: '{"message":"boom"}',
  pattern: "/api/users",
  status: 500,
});

// 3초 지연 — 실제 응답은 그대로 통과
api?.rules.add({ delayMs: 3000, pattern: "/api/feed" });

// 실제 응답 JSON의 일부만 수정 (remove: true는 키 삭제)
api?.rules.add({
  patch: [
    { path: "data.name", value: "테스트" },
    { path: "data.badge", remove: true },
  ],
  pattern: "/api/me",
});
```

### Presets

복잡한 목 데이터를 앱 코드에 정의해 두고 패널에서 골라 쓰는 방식입니다. `presets`를 넘기면 **요청 행을 펼쳤을 때 그 URL에 매칭되는 프리셋만** 상세의 프리셋 섹션에 나타나고, **하나를 고를 때만 적용**됩니다 (자동 적용은 없습니다). 고른 프리셋을 다시 누르면 해제되고, 다른 프리셋을 고르면 이전 프리셋의 룰을 대체합니다.

```tsx
// presets.ts — 목 데이터가 무거우므로 패널과 같은 lazy 청크에 둡니다
import type { HttpOverridePreset } from "@watcha-authentic/react-http-override/core";

export const PRESETS: HttpOverridePreset[] = [
  {
    description: "결제 수단이 등록된 상태",
    id: "pay-ready",
    name: "결제 정상",
    rules: [{ body: JSON.stringify(PAID_USER), pattern: "/api/me", status: 200 }],
  },
  {
    id: "pay-expired",
    name: "카드 만료",
    rules: [
      { patch: [{ path: "card.expired", value: true }], pattern: "/api/me" },
      { delayMs: 1500, pattern: "/api/orders" },
    ],
  },
];

<HttpOverrideLauncher enabled={isStaging} presets={PRESETS} />;
```

프리셋 하나가 룰 여러 개를 가질 수 있어서, "카드 만료 + 주문 API 지연" 같은 상태를 한 번에 세울 수 있습니다. 프리셋이 만든 룰과 패널에서 손으로 만든 룰은 함께 적용되므로, 프리셋을 켠 위에 지연을 추가로 거는 것도 됩니다.

패널에서 프리셋 이름을 바꿀 수 있고(✎), 바꾼 이름은 sessionStorage에 저장됩니다. 빈 값으로 저장하면 앱이 준 원래 이름으로 돌아갑니다.

### Building custom UI with hooks

`useRecords` , `useRules` , `useLauncherVisible` , `usePresetNames` 훅으로 요청 기록·룰·런처 표시 여부·프리셋 이름을 구독해 자체 UI를 만들 수 있습니다.

```tsx
import {
  type HttpOverrideApi,
  useLauncherVisible,
  useRecords,
  useRules,
} from "@watcha-authentic/react-http-override";

const RequestLog = ({ api }: { api: HttpOverrideApi }) => {
  const records = useRecords(api);
  const rules = useRules(api);
  const visible = useLauncherVisible(api);
  if (!visible) return null;
  return (
    <section>
      <p>활성 룰 {rules.length}개</p>
      <ul>
        {records.map((record) => (
          <li key={record.seq}>
            {record.method} {record.url} → {record.status} (
            {record.durationMs}ms){record.mocked ? " [mock]" : ""}
          </li>
        ))}
      </ul>
    </section>
  );
};
```

### Custom rule storage

룰은 기본으로 sessionStorage에 저장됩니다. `storage`를 주입해 저장 위치를 바꿀 수 있습니다. 예를 들어 `createMemoryStorage`를 넘기면 새로고침 시 룰이 사라집니다.

```ts
import {
  createMemoryStorage,
  installHttpOverride,
} from "@watcha-authentic/react-http-override/core";

installHttpOverride({ enabled: true, storage: createMemoryStorage() });
```

## API

### installHttpOverride

devtools 코어를 설치하고 `window.__HTTP_OVERRIDE__`에 할당합니다. `enabled: false`이거나 SSR 환경이면 아무것도 하지 않고 `null`을 반환합니다. 중복 호출(HMR 재실행 등) 시 기존 설치를 그대로 반환합니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `options` | `InstallHttpOverrideOptions` | — | 아래 `InstallHttpOverrideOptions` 참고 |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `api` | `HttpOverrideApi \| null` | 설치된 devtools API. `enabled: false`·SSR이면 `null` |

### InstallHttpOverrideOptions

`installHttpOverride`의 `options` 타입입니다.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `enabled` | `boolean` | — | `false`면 설치하지 않습니다 |
| `baseFetch` | `typeof fetch` | 호출 시점의 `window.fetch` | 실제 요청에 쓸 fetch. 기본값은 설치 시점에 고정하지 않고 호출 시점에 조회하므로, 이후 다른 도구가 `window.fetch`를 패치해도 그 위에서 동작합니다 |
| `maxBodyBytes` | `number` | `65536` | 기록에 남길 응답 body 최대 길이. 초과분은 잘라서 저장합니다 |
| `maxRecords` | `number` | `200` | 보관할 요청 기록 수. 초과하면 오래된 것부터 버립니다 |
| `storage` | `HttpOverrideStorage` | sessionStorage | 룰 저장소. Web Storage를 쓸 수 없는 환경에서는 인메모리로 폴백합니다 |

### createMemoryStorage

인메모리 `HttpOverrideStorage`를 만듭니다. 룰 영속이 필요 없을 때 `storage`에 넘깁니다.

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `storage` | `HttpOverrideStorage` | `Map` 기반 인메모리 저장소 |

### HttpOverrideLauncher

화면 우하단에 런처 버튼을 띄우고, 클릭하면 패널을 여는 컴포넌트입니다. `document.body`에 포털로 렌더하며, `installHttpOverride`가 설치되지 않았거나 `enabled`가 `false`면 아무것도 렌더하지 않습니다. `React.lazy` 마운트를 권장합니다.

#### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `enabled` | `boolean` | — | `false`면 렌더하지 않습니다 |
| `cacheAdapter` | `HttpOverrideCacheAdapter` | — | Cache 탭 데이터 소스. SWR이면 `createSwrAdapter`로 생성합니다. 없으면 Cache 탭을 숨깁니다 |
| `onRevalidate` | `(key: string) => void` | — | 재요청 콜백. API 탭의 재요청·트리 편집·프리셋은 요청 URL로, Cache 탭 재검증은 캐시 키로 호출합니다. 없으면 재요청 버튼을 숨깁니다 |
| `extraTabs` | `HttpOverrideTab[]` | — | 패널에 추가할 확장 탭 |
| `presets` | `HttpOverridePreset[]` | — | 앱이 정의한 룰 묶음. 요청 행 상세에서 URL이 매칭되는 프리셋을 골라 적용합니다 |
| `zIndex` | `number` | `999999` | 런처 버튼·패널의 z-index |

### HttpOverridePanel

런처 버튼·포털·고정 위치가 없는 임베더블 패널입니다. 다른 devtools 셸이나 자체 UI 안에 컴포넌트로 꽂는 용도이며, 열고 닫기는 감싸는 쪽이 담당합니다. `installHttpOverride`가 설치되지 않았으면 아무것도 렌더하지 않습니다.

#### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `cacheAdapter` | `HttpOverrideCacheAdapter` | — | Cache 탭 데이터 소스. 없으면 Cache 탭을 숨깁니다 |
| `onRevalidate` | `(key: string) => void` | — | 재요청 콜백. API 탭의 재요청·트리 편집·프리셋은 요청 URL로, Cache 탭 재검증은 캐시 키로 호출합니다. 없으면 재요청 버튼을 숨깁니다 |
| `extraTabs` | `HttpOverrideTab[]` | — | 패널에 추가할 확장 탭 |
| `presets` | `HttpOverridePreset[]` | — | 앱이 정의한 룰 묶음. 요청 행 상세에서 URL이 매칭되는 프리셋을 골라 적용합니다 |

### createSwrAdapter

SWR 캐시를 Cache 탭에 연결하는 어댑터를 만듭니다. 구조적 타이핑이라 `swr` 패키지에 의존하지 않으며, `useSWRConfig()`가 반환하는 `cache`·`mutate`를 그대로 넘기면 됩니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `cache` | `SwrLikeCache` | — | `useSWRConfig()`의 `cache` |
| `mutate` | `SwrLikeMutate` | — | `useSWRConfig()`의 `mutate` |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `cacheAdapter` | `HttpOverrideCacheAdapter` | `HttpOverrideLauncher`·`HttpOverridePanel`의 `cacheAdapter`로 전달 |
| `onRevalidate` | `(url: string) => void` | 전달받은 URL을 포함하는 캐시 키를 전부 `mutate`로 재검증 (배열 키도 직렬화 형태로 매칭). `onRevalidate` prop으로 전달 |

### useRecords

요청 기록 목록을 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `installHttpOverride`가 반환한 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `records` | `HttpOverrideRecord[]` | 현재 요청 기록 목록 |

### useRules

활성 룰 목록을 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `installHttpOverride`가 반환한 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `rules` | `HttpOverrideRule[]` | 현재 룰 목록 |

### useLauncherVisible

런처 버튼 표시 여부를 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `installHttpOverride`가 반환한 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `visible` | `boolean` | 런처 버튼 표시 여부 |

### usePresetNames

패널에서 바꾼 프리셋 이름 맵을 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `installHttpOverride`가 반환한 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `names` | `Record<string, string>` | 프리셋 id -> 패널에서 바꾼 이름. 안 바꾼 프리셋은 키가 없습니다 |

### HttpOverrideApi

`installHttpOverride`가 반환하고 `window.__HTTP_OVERRIDE__`에 할당되는 API입니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `fetch` | `typeof fetch` | 룰 적용·기록을 수행하는 fetch. 앱의 API 관문에서 위임해 씁니다 |
| `records.getSnapshot` | `() => HttpOverrideRecord[]` | 현재 요청 기록 |
| `records.subscribe` | `HttpOverrideSubscribe` | 기록 변경 구독 |
| `records.clear` | `() => void` | 기록 비우기 |
| `presetNames.getSnapshot` | `() => Record<string, string>` | 프리셋 id → 패널에서 바꾼 이름 |
| `presetNames.set` | `(id: string, name: string) => void` | 프리셋 이름 덮어쓰기 |
| `presetNames.reset` | `(id: string) => void` | 앱이 준 원래 이름으로 되돌리기 |
| `presetNames.subscribe` | `HttpOverrideSubscribe` | 이름 변경 구독 |
| `rules.getSnapshot` | `() => HttpOverrideRule[]` | 현재 룰 목록 |
| `rules.add` | `(input: HttpOverrideRuleInput) => HttpOverrideRule` | 룰 추가. `id`를 생략하면 자동 생성되고, 같은 `id`가 이미 있으면 그 룰을 교체합니다. 같은 `pattern`의 룰은 여러 개 공존하며 합성됩니다 |
| `rules.update` | `(id: string, patch: Partial<Omit<HttpOverrideRule, "id">>) => void` | 룰 수정 |
| `rules.remove` | `(id: string) => void` | 룰 삭제 |
| `rules.clear` | `() => void` | 룰 전체 삭제 |
| `rules.subscribe` | `HttpOverrideSubscribe` | 룰 변경 구독 |
| `launcher.getSnapshot` | `() => boolean` | 런처 버튼 표시 여부 |
| `launcher.subscribe` | `HttpOverrideSubscribe` | 런처 표시 여부 구독 |
| `show` | `() => void` | 런처 버튼 표시. 브라우저 콘솔에서 `__HTTP_OVERRIDE__.show()`로 호출할 수 있습니다 |
| `hide` | `() => void` | 런처 버튼 숨김 |
| `toggle` | `() => void` | 런처 버튼 표시 토글 |

### HttpOverrideRule

요청을 가로채는 룰입니다. `status`는 실제 요청 없이 목 응답을 반환하고, `patch`는 실제 응답 JSON을 수정하며, `delayMs`는 응답을 지연시킵니다.

같은 URL에 여러 룰이 매칭되면 다음 규칙으로 합성됩니다.

- **지연**: `delayMs > 0`인 첫 룰의 값만 적용됩니다 (여러 지연 룰이 있어도 중첩되지 않습니다)
- **목**: `status`가 있는 첫 룰이 목 응답을 반환합니다. 목은 실제 요청을 보내지 않으므로, 이때 매칭된 모든 룰의 `patch`는 적용되지 않습니다
- **패치**: 목 룰이 없으면, `status` 없는 매칭 룰들의 `patch`가 룰 순서대로 전부 적용됩니다

그래서 "1.5초 지연 + 500 목", "지연 + 특정 필드 패치"처럼 룰을 나눠 걸어 조합할 수 있습니다.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `id` | `string` | — | 룰 식별자 |
| `label` | `string` | — | 룰 바에 패턴 대신 표시할 이름. 프리셋이 만든 룰에 프리셋 이름이 들어갑니다 |
| `pattern` | `string` | — | URL에 매칭할 정규식 문자열 |
| `status` | `number` | — | 지정 시 실제 요청 없이 이 상태 코드로 목 응답을 반환합니다 |
| `body` | `string` | — | 목 응답 body. `status`와 함께 씁니다 |
| `delayMs` | `number` | — | 응답 지연(ms). 목·패치·통과 어느 경우에도 먼저 적용되며, 여러 룰이 매칭되면 `delayMs > 0`인 첫 룰만 적용됩니다 |
| `patch` | `{ path: string; value?: unknown; remove?: boolean }[]` | — | 실제 응답 JSON에서 `path`(점 표기)의 값만 `value`로 바꿉니다. `remove: true`면 해당 키를 삭제합니다 |

### HttpOverrideRuleInput

`rules.add`의 입력 타입입니다. `HttpOverrideRule`에서 `id`만 선택 사항으로 바뀐 형태이며, 생략하면 자동 생성됩니다.

### HttpOverridePreset

앱이 정의해 `presets`로 넘기는 룰 묶음입니다. 패널에서 고를 때만 적용됩니다.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `id` | `string` | — | 프리셋 식별자. 룰 `id`에 그대로 쓰이므로 콜론은 피하세요 |
| `name` | `string` | — | 프리셋 칸에 표시할 이름 |
| `description` | `string` | — | 이름 아래 설명 |
| `rules` | `HttpOverrideRuleInput[]` | — | 이 프리셋이 적용할 룰. 여러 개면 함께 적용됩니다 |

### HttpOverrideRecord

요청 1건의 기록입니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `seq` | `number` | 기록 순번 |
| `url` | `string` | 요청 URL |
| `method` | `string` | HTTP 메서드 (대문자) |
| `status` | `number` | 응답 상태 코드. 네트워크 에러면 `0` |
| `ok` | `boolean` | `Response.ok` 여부 |
| `mocked` | `boolean` | 목 응답 여부 |
| `patched` | `boolean \| undefined` | `patch` 룰이 적용된 응답이면 `true` |
| `ruleId` | `string \| undefined` | 적용된 룰 중 대표 1개의 `id` (목 룰 → 첫 패치 룰 → 첫 매칭 룰 순) |
| `startedAt` | `number` | 요청 시작 시각 (epoch ms) |
| `durationMs` | `number` | 소요 시간(ms) |
| `responseBody` | `string \| null` | 응답 body. clone 후 비동기로 채워지므로 채워지기 전엔 `null` |
| `error` | `string \| undefined` | 네트워크 에러 메시지 |

### HttpOverrideStorage

룰 저장소 인터페이스입니다. Web Storage와 같은 모양입니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `getItem` | `(key: string) => string \| null` | 값 조회 |
| `setItem` | `(key: string, value: string) => void` | 값 저장 |
| `removeItem` | `(key: string) => void` | 값 삭제 |

### HttpOverrideSubscribe

`(listener: () => void) => () => void` — 변경 리스너를 등록하고 해제 함수를 반환합니다. `useSyncExternalStore`와 호환됩니다.

### HttpOverrideTab

`extraTabs`로 넘기는 확장 탭 하나의 정의입니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `key` | `string` | 탭 식별자 |
| `label` | `string` | 탭 제목 |
| `render` | `() => ReactNode` | 탭 내용을 렌더하는 함수 |

### HttpOverrideCacheAdapter

Cache 탭 데이터 소스 인터페이스입니다. SWR이 아니어도 이 모양만 맞추면 어떤 캐시든 연결할 수 있습니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `getEntries` | `() => HttpOverrideCacheEntry[]` | 현재 캐시 엔트리 목록 |

### HttpOverrideCacheEntry

Cache 탭에 표시되는 캐시 엔트리 하나입니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `key` | `string` | 캐시 키 |
| `data` | `unknown` | 캐시된 데이터 |
| `error` | `unknown` | 에러 |
| `isValidating` | `boolean \| undefined` | 재검증 중 여부 |

### SwrLikeCache

`createSwrAdapter`의 `cache` 타입입니다. `useSWRConfig()`의 `cache`가 이 모양을 만족합니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `get` | `(key: string) => unknown` | 키의 캐시 상태 조회 |
| `keys` | `() => IterableIterator<string>` | 캐시 키 목록 |

### SwrLikeMutate

`(key: string) => unknown` — 키를 재검증하는 함수입니다. `useSWRConfig()`의 `mutate`가 이 모양을 만족합니다.

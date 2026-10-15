# @watcha-authentic/react-http-override

[![npm version](https://img.shields.io/npm/v/@watcha-authentic/react-http-override)](https://www.npmjs.com/package/@watcha-authentic/react-http-override)

staging 환경에서 fetch 요청을 관찰하고 에러·지연·빈 상태를 시뮬레이션하는 devtools 패널입니다. 엔트리 파일에서 `installHttpOverride`를 한 번 호출하면 `window.fetch`를 가로채 요청을 기록하고, 패널 버튼이 화면 우하단에 자동으로 뜹니다.

엔트리는 4개입니다. 앱의 React 버전에 맞는 것 하나를 쓰면 됩니다.

- `@watcha-authentic/react-http-override/auto` — **React 18 이상.** 설치와 패널 마운트를 한 번에 합니다.
- `@watcha-authentic/react-http-override/auto-legacy` — **React 17.** 같은 API를 `ReactDOM.render`로 마운트합니다.
- `@watcha-authentic/react-http-override/core` — React 없이 동작하는 코어. 패널 없이 기록·룰만 쓰거나, 런처 컴포넌트를 직접 마운트할 때 씁니다.
- `@watcha-authentic/react-http-override` — 런처·임베드 패널 컴포넌트와 훅. 코어의 export도 함께 제공합니다.

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

엔트리 파일 가장 위, 하이드레이션 전에 한 번 호출합니다. 그래야 첫 요청부터 기록되고, 다른 라이브러리가 `fetch` 참조를 잡아 두기 전에 가로챌 수 있습니다. SSR에서는 아무것도 하지 않고, HMR로 다시 실행돼도 기존 설치를 재사용합니다. 패널 UI는 이때만 동적 import로 받으므로 조건이 `false`인 환경에서는 패널 코드를 내려받지 않습니다.

```ts
import { installHttpOverride } from "@watcha-authentic/react-http-override/auto";

if (import.meta.env.MODE === "staging") {
  installHttpOverride();
}
```

React 17 앱은 `/auto-legacy`에서 같은 함수를 가져옵니다.

```ts
import { installHttpOverride } from "@watcha-authentic/react-http-override/auto-legacy";
```

앱 코드는 평소처럼 `fetch`를 호출하면 됩니다. 요청 행을 펼치면 URL을 origin·경로·쿼리 파라미터로 나눠 보여주고, 요청 본문이 있으면 Payload 섹션에 나옵니다. 패널에서 만든 룰은 sessionStorage에 저장되어 새로고침해도 유지되고, 탭끼리는 격리됩니다. 런처 버튼은 패널의 "버튼 숨기기"로 숨기고 `Ctrl+Shift+H`로 다시 켤 수 있습니다.

### Revalidating after a rule change

패널에서 응답 값을 바꾸거나 프리셋을 적용하면 그 URL을 다시 불러와야 화면에 반영됩니다. `onRevalidate`를 넘기면 앱의 데이터 계층이 다시 요청하므로 **앱 화면까지 바로 바뀝니다.** 넘기지 않으면 GET 요청만 패키지가 같은 URL로 다시 보내서 패널의 기록에만 반영됩니다.

기록된 URL은 절대 주소이고 SWR 키는 보통 엔드포인트라서, 경로로 맞춥니다. 키 규칙은 앱마다 다르니 그에 맞게 조정합니다.

```ts
import { installHttpOverride } from "@watcha-authentic/react-http-override/auto";
import { mutate } from "swr";

installHttpOverride({
  onRevalidate: (url) => {
    const path = new URL(url, location.origin).pathname;
    return mutate((key) => typeof key === "string" && path.endsWith(key));
  },
});
```

### Showing SSR data

SSR 앱은 서버가 HTML에 심어 둔 초기 데이터를 `ssrData`로 넘기면 됩니다. 키마다 한 행씩 **서버 출처**로 테이블 맨 위에 들어가고, 상세에서 데이터를 볼 수 있습니다. 변수 이름은 앱마다 다릅니다.

```ts
installHttpOverride({
  // 서버가 HTML에 심어 둔 객체 (앱마다 다름)
  ssrData: window.__SWR_FALLBACK__,
});
```

브라우저 요청 중 경로가 `.data`로 끝나는 것(react-router·Remix의 서버 loader 요청)도 서버 출처로 표시됩니다. 판별 기준은 `isServerRequest`로 바꿀 수 있습니다.

```ts
installHttpOverride({
  isServerRequest: (url) => url.includes("/bff/"),
});
```

### Filtering out noise

`window.fetch`를 전부 가로채므로 GA·Sentry·프레임워크 내부 요청까지 기록됩니다. `shouldRecord`가 `false`를 돌려준 요청은 기록도 룰 적용도 없이 그대로 통과합니다. 어떤 요청이 노이즈인지는 앱마다 달라서 기본 제외 목록은 없습니다.

```ts
installHttpOverride({
  shouldRecord: (url) => url.startsWith(API_ORIGIN),
});
```

no-cors 요청의 opaque 응답(상태·본문을 브라우저가 숨긴 응답)은 기록에 `opaque` 칩으로 표시되고, 정상·에러 어느 쪽으로도 세지 않습니다.

### Presets

복잡한 목 데이터를 앱 코드에 정의해 두고 패널에서 골라 쓰는 방식입니다. `presets`를 넘기면 **요청 행을 펼쳤을 때 그 URL에 매칭되는 프리셋만** 상세의 프리셋 섹션에 나타나고, **하나를 고를 때만 적용**됩니다 (자동 적용은 없습니다). 고른 프리셋을 다시 누르면 해제되고, 다른 프리셋을 고르면 이전 프리셋의 룰을 대체합니다.

```ts
import type { HttpOverridePreset } from "@watcha-authentic/react-http-override/core";

const PRESETS: HttpOverridePreset[] = [
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

installHttpOverride({ presets: PRESETS });
```

프리셋 하나가 룰 여러 개를 가질 수 있어서, "카드 만료 + 주문 API 지연" 같은 상태를 한 번에 세울 수 있습니다. 프리셋이 만든 룰과 패널에서 손으로 만든 룰은 함께 적용되므로, 프리셋을 켠 위에 지연을 추가로 거는 것도 됩니다.

패널에서 프리셋 이름을 바꿀 수 있고(✎), 바꾼 이름은 sessionStorage에 저장됩니다. 빈 값으로 저장하면 앱이 준 원래 이름으로 돌아갑니다.

### Mounting the launcher yourself

`extraTabs`로 React Query devtools처럼 앱의 Provider가 필요한 탭을 끼우려면, 자동 마운트를 끄고 런처 컴포넌트를 앱 트리 안에 직접 둡니다. 설치되지 않았거나 하이드레이션 전이면 아무것도 렌더하지 않으므로 조건 분기는 필요 없습니다.

```tsx
import { installHttpOverride } from "@watcha-authentic/react-http-override/auto";
import {
  HttpOverrideLauncher,
  type HttpOverrideTab,
} from "@watcha-authentic/react-http-override";
import { lazy } from "react";

installHttpOverride({ autoMount: false });

const ReactQueryPanel = lazy(() =>
  import("@tanstack/react-query-devtools").then((module) => ({
    default: module.ReactQueryDevtoolsPanel,
  }))
);

const extraTabs: HttpOverrideTab[] = [
  { key: "react-query", label: "React Query", render: () => <ReactQueryPanel /> },
];

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* ...앱... */}
    <HttpOverrideLauncher extraTabs={extraTabs} />
  </QueryClientProvider>
);
```

### Embedding the panel elsewhere

반대로 이 패널을 다른 devtools 셸 안에 꽂을 수도 있습니다. `HttpOverridePanel`은 런처 버튼·포털·고정 위치가 없는 임베더블 패널로, 열고 닫는 것은 감싸는 쪽이 담당합니다.

```tsx
import { HttpOverridePanel } from "@watcha-authentic/react-http-override";

const MyDevtoolsShell = () => (
  <aside>
    <HttpOverridePanel />
  </aside>
);
```

### Controlling rules programmatically

패널 UI 없이도 `getHttpOverride()`가 돌려주는 API의 `rules`로 룰을 제어할 수 있습니다. `status`는 실제 요청 없이 목 응답을 반환하고, `delayMs`만 있으면 실제 응답을 지연 후 그대로 통과시키며, `patch`는 실제 응답 JSON에서 지정한 path의 값만 수정합니다. 같은 URL에 여러 룰이 매칭되면 서로 합성됩니다 — 자세한 규칙은 [HttpOverrideRule](#httpoverriderule)을 참고하세요.

```ts
import { getHttpOverride } from "@watcha-authentic/react-http-override/core";

const api = getHttpOverride();

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

### Building custom UI with hooks

`useHttpOverrideApi`로 설치된 API를 얻고, `useRecords`·`useRules`·`useLauncherVisible`·`usePresetNames`로 요청 기록·룰·런처 표시 여부·프리셋 이름을 구독해 자체 UI를 만들 수 있습니다.

```tsx
import {
  type HttpOverrideApi,
  useHttpOverrideApi,
  useLauncherVisible,
  useRecords,
  useRules,
} from "@watcha-authentic/react-http-override";

const RequestLog = () => {
  const api = useHttpOverrideApi();
  if (api === null) return null;
  return <RequestLogContent api={api} />;
};

const RequestLogContent = ({ api }: { api: HttpOverrideApi }) => {
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
            {record.method} {record.url} →{" "}
            {record.state === "pending" ? "대기 중" : record.status}
            {record.mocked ? " [mock]" : ""}
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
import { installHttpOverride } from "@watcha-authentic/react-http-override/auto";
import { createMemoryStorage } from "@watcha-authentic/react-http-override/core";

installHttpOverride({ storage: createMemoryStorage() });
```

### Uninstalling

테스트나 페이지 단위로 켜고 끌 때는 `uninstallHttpOverride`로 원래 `fetch`를 되돌리고 패널을 걷어냅니다. 그 사이 다른 코드가 `window.fetch`를 다시 패치했다면 그 패치는 건드리지 않습니다.

```ts
import {
  installHttpOverride,
  uninstallHttpOverride,
} from "@watcha-authentic/react-http-override/auto";

installHttpOverride();
// ...
uninstallHttpOverride();
```

## API

### installHttpOverride

`/auto`·`/auto-legacy` 엔트리의 함수입니다. 코어를 설치하고 페이지 로드가 끝난 뒤 런처를 `document.body`에 자동으로 띄웁니다. `/core` 엔트리의 같은 이름 함수는 코어만 설치하고 패널을 띄우지 않습니다.

SSR 환경이면 아무것도 하지 않고 `null`을 반환합니다. 중복 호출(HMR 재실행 등) 시 기존 설치를 그대로 반환하고 패널도 하나만 유지합니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `options` | `InstallHttpOverrideOptions` | `{}` | 아래 `InstallHttpOverrideOptions` 참고 |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `api` | `HttpOverrideApi \| null` | 설치된 devtools API. SSR이면 `null` |

### InstallHttpOverrideOptions

`installHttpOverride`의 `options` 타입입니다. `autoMount`·`presets`는 `/auto`·`/auto-legacy` 엔트리에만 있고, 나머지는 `/core`에도 있습니다.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `autoMount` | `boolean` | `true` | `false`면 패널을 띄우지 않습니다. `HttpOverrideLauncher`를 직접 마운트할 때 씁니다 |
| `presets` | `HttpOverridePreset[]` | — | 앱이 정의한 룰 묶음. 요청 행 상세에서 URL이 매칭되는 프리셋을 골라 적용합니다 |
| `onRevalidate` | `(url: string) => Promise<unknown> \| void` | — | 패널에서 룰을 바꾼 뒤 앱이 그 URL을 다시 불러오게 하는 콜백. 없으면 GET 요청만 패키지가 같은 URL로 다시 보냅니다 |
| `ssrData` | `Record<string, unknown>` | — | SSR 초기 데이터. 키마다 서버 출처 행으로 기록합니다 |
| `isServerRequest` | `(url: string) => boolean` | 경로가 `.data`로 끝나는지 | 서버 출처로 표시할 요청 판별 |
| `shouldRecord` | `(url: string, method: string) => boolean` | 모두 기록 | `false`면 기록도 룰 적용도 없이 원본 `fetch`로 통과 |
| `maxBodyBytes` | `number` | `65536` | 기록에 남길 응답 body 최대 크기 (UTF-8 바이트 기준). 초과분은 잘라서 저장합니다 |
| `maxRecords` | `number` | `200` | 보관할 요청 기록 수. 초과하면 오래된 것부터 버립니다 |
| `storage` | `HttpOverrideStorage` | sessionStorage | 룰 저장소. Web Storage를 쓸 수 없는 환경에서는 인메모리로 폴백합니다 |

### uninstallHttpOverride

원래 `fetch`로 되돌리고, 자동으로 띄운 패널이 있으면 걷어냅니다. 설치되지 않은 상태에서 호출하면 아무것도 하지 않습니다.

### getHttpOverride

`/core` 엔트리의 함수입니다. 설치된 devtools API를 돌려줍니다.

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `api` | `HttpOverrideApi \| null` | 설치 안 됐거나 SSR이면 `null` |

### createMemoryStorage

인메모리 `HttpOverrideStorage`를 만듭니다. 룰 영속이 필요 없을 때 `storage`에 넘깁니다.

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `storage` | `HttpOverrideStorage` | `Map` 기반 인메모리 저장소 |

### HttpOverrideLauncher

화면 우하단에 런처 버튼을 띄우고, 클릭하면 패널을 여는 컴포넌트입니다. `document.body`에 포털로 렌더합니다. `/auto` 엔트리가 자동으로 마운트하는 컴포넌트이며, `autoMount: false`로 끄고 직접 둘 수 있습니다. 설치되지 않았거나 하이드레이션 전이면 아무것도 렌더하지 않습니다.

#### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `extraTabs` | `HttpOverrideTab[]` | — | 패널에 추가할 확장 탭 |
| `presets` | `HttpOverridePreset[]` | — | 앱이 정의한 룰 묶음. 요청 행 상세에서 URL이 매칭되는 프리셋을 골라 적용합니다 |
| `zIndex` | `number` | `999999` | 런처 버튼·패널의 z-index |

### HttpOverridePanel

런처 버튼·포털·고정 위치가 없는 임베더블 패널입니다. 다른 devtools 셸이나 자체 UI 안에 컴포넌트로 꽂는 용도이며, 열고 닫기는 감싸는 쪽이 담당합니다. 설치되지 않았거나 하이드레이션 전이면 아무것도 렌더하지 않습니다.

#### Props

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `extraTabs` | `HttpOverrideTab[]` | — | 패널에 추가할 확장 탭 |
| `presets` | `HttpOverridePreset[]` | — | 앱이 정의한 룰 묶음. 요청 행 상세에서 URL이 매칭되는 프리셋을 골라 적용합니다 |

### useHttpOverrideApi

설치된 devtools API를 돌려주는 훅입니다. 서버 렌더와 하이드레이션 첫 렌더에서는 `null`을 돌려줘 hydration mismatch를 막고, 그 뒤에 실제 API를 돌려줍니다.

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `api` | `HttpOverrideApi \| null` | 설치 안 됐거나 하이드레이션 전이면 `null` |

### useRecords

요청 기록 목록을 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `useHttpOverrideApi` 또는 `installHttpOverride`가 돌려준 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `records` | `HttpOverrideRecord[]` | 현재 요청 기록 목록 |

### useRules

활성 룰 목록을 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `useHttpOverrideApi` 또는 `installHttpOverride`가 돌려준 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `rules` | `HttpOverrideRule[]` | 현재 룰 목록 |

### useLauncherVisible

런처 버튼 표시 여부를 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `useHttpOverrideApi` 또는 `installHttpOverride`가 돌려준 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `visible` | `boolean` | 런처 버튼 표시 여부 |

### usePresetNames

패널에서 바꾼 프리셋 이름 맵을 구독하는 훅입니다.

#### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `api` | `HttpOverrideApi` | — | `useHttpOverrideApi` 또는 `installHttpOverride`가 돌려준 API |

#### Returns

| Name | Type | Description |
| ---- | ---- | ----------- |
| `names` | `Record<string, string>` | 프리셋 id -> 패널에서 바꾼 이름. 안 바꾼 프리셋은 키가 없습니다 |

### HttpOverrideApi

`installHttpOverride`가 돌려주고 `getHttpOverride`·`useHttpOverrideApi`로 다시 얻을 수 있는 API입니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
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
| `revalidate` | `(url: string, method: string) => void` | 그 URL을 다시 불러옵니다. `onRevalidate`가 있으면 그 콜백을 부르고, 없으면 GET만 같은 URL로 다시 보냅니다 |
| `canRevalidate` | `(method: string) => boolean` | 이 method의 요청을 다시 불러올 수 있는지. `onRevalidate`가 없으면 GET만 `true` |
| `launcher.getSnapshot` | `() => boolean` | 런처 버튼 표시 여부 |
| `launcher.subscribe` | `HttpOverrideSubscribe` | 런처 표시 여부 구독 |
| `show` | `() => void` | 런처 버튼 표시 |
| `hide` | `() => void` | 런처 버튼 숨김 |
| `toggle` | `() => void` | 런처 버튼 표시 토글. `Ctrl+Shift+H`가 같은 동작을 합니다 |

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

요청 1건의 기록입니다. 요청이 시작되면 `pending` 상태로 먼저 기록되고, 응답이 오면 같은 기록이 갱신됩니다.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `seq` | `number` | 기록 순번 |
| `url` | `string` | 요청 URL. `ssrData` 행이면 그 키 |
| `method` | `string` | HTTP 메서드 (대문자). `ssrData` 행이면 `"SSR"` |
| `state` | `HttpOverrideRecordState` | `"pending"` → `"done"` 또는 `"error"` |
| `source` | `HttpOverrideRecordSource` | `"server"`는 `ssrData` 행과 `isServerRequest`에 걸린 요청, 그 외는 `"client"` |
| `status` | `number \| null` | 응답 상태 코드. 응답 전이면 `null`, 네트워크 에러와 opaque 응답이면 `0`, `ssrData` 행이면 `null` |
| `ok` | `boolean` | `Response.ok` 여부 |
| `opaque` | `boolean \| undefined` | no-cors 요청의 opaque 응답이면 `true` |
| `mocked` | `boolean` | 목 응답 여부 |
| `patched` | `boolean \| undefined` | `patch` 룰이 적용된 응답이면 `true` |
| `ruleId` | `string \| undefined` | 적용된 룰 중 대표 1개의 `id` (목 룰 → 첫 패치 룰 → 첫 매칭 룰 순) |
| `startedAt` | `number` | 요청 시작 시각 (epoch ms) |
| `durationMs` | `number \| null` | 소요 시간(ms). 응답 전과 `ssrData` 행은 `null` |
| `requestBody` | `string \| null` | 요청 body. 문자열·`URLSearchParams`는 원문, `FormData`는 키·값 JSON(파일은 이름·크기), 바이너리는 크기 요약. 없으면 `null` |
| `responseBody` | `string \| null` | 응답 body. clone 후 비동기로 채워지므로 채워지기 전엔 `null` |
| `error` | `string \| undefined` | 네트워크 에러 메시지 |

### HttpOverrideRecordState

`"pending" | "done" | "error"` — 기록의 진행 상태입니다.

### HttpOverrideRecordSource

`"client" | "server"` — 기록의 출처입니다. 패널 테이블의 행 아이콘이 이 값을 따릅니다.

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

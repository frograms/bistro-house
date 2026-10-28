# @watcha-authentic/web-observability

브라우저와 SSR 서버의 오류·로그·Web Vitals·트레이스를 OpenTelemetry 형식으로 보내는 모듈입니다. Sentry 와 비슷하게 `init`·`captureException`·`logger` 로 씁니다. 수집 백엔드는 OTel Collector → ClickStack(HyperDX) 구성을 기준으로 합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=web-observability)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [Environment variables](#environment-variables)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@opentelemetry/browser-instrumentation` `0.9.0` — 브라우저 전역 오류를 잡는 OTel 공식 계측입니다. 실험 단계 API 라 버전을 고정합니다.
- `@opentelemetry/api-logs` `^0.223.0` — 위 계측에 넘기는 로그 기록기 타입입니다.
- `web-vitals` `^6.2.3` — Web Vitals 측정입니다. 지연 로드됩니다.

### Peer dependencies

**`@opentelemetry/api` `^1.9.0` 은 반드시 프로젝트에 설치합니다.** 전역에 등록되는 API 라서 Sentry 와 같은 인스턴스 하나만 있어야 서버 트레이스가 이어집니다. `pnpm why @opentelemetry/api` 로 한 벌인지 확인합니다.

나머지는 쓰는 진입점에 맞춰 설치합니다.

| 패키지                                    | range         | 필요한 진입점               |
| ----------------------------------------- | ------------- | --------------------------- |
| `@hyperdx/browser`                        | `>=0.26.0`    | `/browser`                  |
| `@opentelemetry/core`                     | `>=1.30.0 <3` | `/server`, `/server/sentry` |
| `@opentelemetry/sdk-trace-base`           | `>=1.30.0 <3` | `/server`, `/server/sentry` |
| `@opentelemetry/exporter-trace-otlp-http` | `>=0.57.0`    | `/server`, `/server/sentry` |
| `@opentelemetry/instrumentation`          | `>=0.57.0`    | `/server/http`              |
| `@opentelemetry/instrumentation-http`     | `>=0.57.0`    | `/server/http`              |
| `@sentry/opentelemetry`                   | `>=9.0.0`     | `/server/sentry`            |

Sentry 와 함께 쓰는 동안에는 OTel SDK 패키지의 메이저를 Sentry 에 맞춥니다(Sentry 9 → OTel 1.x, Sentry 10 → OTel 2.x).

## Installation

```bash
pnpm add @watcha-authentic/web-observability @opentelemetry/api @hyperdx/browser \
  @opentelemetry/core @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http
```

## Usage

### 앱 코드

앱 코드는 패키지 이름 하나만 import 합니다. 브라우저와 서버(SSR 포함) 어디서 돌든 같은 코드를 쓰면 번들러가 맞는 구현을 고릅니다.

```ts
import * as O11y from "@watcha-authentic/web-observability";

try {
  await save();
} catch (error) {
  O11y.captureException(error, { "app.reason": "save" });
}

O11y.logger.warn("allReady 없음", { from: "render" });
```

Sentry 의 fingerprint·tags·contexts 는 속성으로 넘깁니다. 그룹 키는 `o11y.fingerprint` 에 둡니다.

```ts
O11y.captureException(error, { "o11y.fingerprint": "duplicate-locale-prefix" });
```

아래 배선은 진입 파일에서 한 번만 합니다. 함수와 옵션의 상세는 각 선언의 JSDoc 에 있습니다.

### 브라우저 진입 파일

hydrate 전에, 진입 모듈 맨 위에서 `init` 을 호출해야 hydration 중 오류까지 잡힙니다.

```ts
const rum = O11y.rumOptionsFromEnv(window.__ENVS__);
if (rum) {
  O11y.init({
    ...rum,
    release: window.__ENVS__.SENTRY_RELEASE,
    userId: window.__SENTRY_USER__?.code,
    assetUrls: [/cdn\.example\.com/],
    errors: {
      allowUrls: [/^https:\/\/cdn\.example\.com\/my-app\//],
      ignoreErrors: [/AbortError/],
    },
  });
}
```

오류 경계(React Router `ErrorBoundary` 포함)가 잡은 오류는 전역 오류로 올라오지 않으므로 직접 보고합니다.

```tsx
<HydratedRouter
  onError={(error) => {
    if (error instanceof Error) {
      O11y.captureException(error, { "o11y.exception.source": "react-router" });
    }
  }}
/>
```

hydration 불일치처럼 React 가 복구한 오류는 전역 `error` 이벤트로 올라와 자동으로 잡힙니다. `onRecoverableError` 를 덮어쓰면 이 경로가 사라지므로 덮어쓰지 않습니다.

### 서버 진입 파일

```ts
import * as O11y from "@watcha-authentic/web-observability";
import {
  appendTraceparentServerTiming,
  captureServerException,
  createPathMatcher,
  getServerTraceparent,
  jsonAccessLog,
  pickRumEnv,
  routePathFromMatches,
  setServerRoute,
} from "@watcha-authentic/web-observability/server";

// 서버 시작 시. Sentry.init 을 쓰면 그 뒤에 호출합니다.
O11y.init();

// 액세스 로그
const isUntracedPath = createPathMatcher(["/health_check", "/_rx/"]);
app.use(jsonAccessLog((req) => isUntracedPath(req.originalUrl)));

// 브라우저로 넘길 RUM 설정. window 에 주입하는 env 객체에 펼쳐 넣습니다.
const envs = { ...otherEnvs, ...pickRumEnv(process.env) };

// entry.server handleRequest
const route = routePathFromMatches(routerContext.staticHandlerContext.matches);
if (route) setServerRoute(request.method, route);
appendTraceparentServerTiming(responseHeaders);

// 루트 loader: <meta name="traceparent" content={traceparent} />
const traceparent = getServerTraceparent();

// handleError
captureServerException(error, { "http.request.method": request.method });
```

### Sentry 와 함께 쓰는 동안

Sentry 10(Node)은 OTel 트레이서를 직접 등록합니다. 아래 설정은 그 트레이서의 스팬을 OTLP 로도 보냅니다. Sentry 를 걷어내면 지웁니다.

```ts
import * as Sentry from "@sentry/react-router";
import {
  createPathMatcher,
  readOtelEnv,
} from "@watcha-authentic/web-observability/server";
import { instrumentIncomingHttp } from "@watcha-authentic/web-observability/server/http";
import {
  installW3CPropagator,
  sentryDsnOptions,
  sentryOtelOptions,
} from "@watcha-authentic/web-observability/server/sentry";

const otel = readOtelEnv(process.env);
Sentry.init({
  ...sentryDsnOptions(process.env.SENTRY_DSN, otel),
  integrations: [Sentry.httpIntegration({ disableIncomingRequestSpans: true })],
  ...sentryOtelOptions(otel),
});
installW3CPropagator(otel);
instrumentIncomingHttp(createPathMatcher(["/health_check"]));
```

## Environment variables

비밀 값이 아니므로 배포 설정의 일반 환경 변수로 관리합니다.

| 변수                                 | 기본값 | 설명                                                               |
| ------------------------------------ | ------ | ------------------------------------------------------------------ |
| `OTEL_SERVICE_NAME`                  | —      | 서버 `service.name`. 브라우저는 뒤에 `-browser` 를 붙입니다        |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | —      | 없으면 서버 트레이스를 끕니다                                      |
| `OTEL_TRACES_SAMPLE_RATE`            | `0`    | 서버 트레이스 비율(Sentry 병행 기간 전용)                          |
| `RUM_ENABLED`                        | —      | `"true"` 일 때만 브라우저에서 수집합니다                           |
| `RUM_PATH`                           | —      | 브라우저 신호를 받을 같은 출처 경로(예: `/_/rum`)                  |
| `RUM_ERRORS_SAMPLE_RATE`             | `1`    | 오류·로그를 보낼 세션 비율                                         |
| `RUM_VITALS_SAMPLE_RATE`             | `1`    | Web Vitals 를 보낼 세션 비율                                       |
| `RUM_FULL_SAMPLE_RATE`               | `0.1`  | HyperDX SDK(브라우저 트레이스)를 켤 세션 비율                      |
| `RUM_REPLAY_SAMPLE_RATE`             | `0.1`  | 위 세션 중 리플레이를 녹화할 비율                                  |
| `RUM_MASK_TEXT`                      | `true` | `"false"` 면 리플레이 텍스트를 가리지 않습니다(입력값은 항상 가림) |

비율 값이 0~1 숫자가 아니면 경고를 남기고 기본값을 씁니다.

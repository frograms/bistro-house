# @watcha-authentic/web-observability

브라우저와 SSR 서버의 오류·로그·Web Vitals·트레이스를 OpenTelemetry 형식으로 보내는 모듈입니다. Sentry 처럼 `init` 한 번, 어디서든 `logger` 로 씁니다. 종착지(수신 경로·Collector 주소)는 앱이 `init` 옵션으로 넘깁니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=web-observability)

## Table of contents

- [Entry points](#entry-points)
- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)

## Entry points

```
앱 일반 코드 ──────────▶ "."        init · logger · getSessionId (브라우저·서버 자동 선택)
서버 진입 파일 ────────▶ "/server"  요청 파이프라인 배선: 액세스 로그 · traceparent · 라우트 · HTTP 계측
Sentry 병행 기간에만 ──▶ "/sentry"  Sentry 트레이서에 서버 트레이스 연결(Sentry 제거 시 삭제)
```

`.` 은 번들러의 `browser`·`node` 조건으로 브라우저 구현과 서버 구현 중 하나가 골라집니다. SSR 렌더링·loader 처럼 서버에서 도는 코드는 서버 구현을 씁니다. 두 구현은 공개 API 가 같습니다.

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@opentelemetry/browser-instrumentation` `0.9.0` — 브라우저 전역 오류를 잡는 OTel 공식 계측입니다. 실험 단계 API 라 버전을 고정합니다.
- `@opentelemetry/api-logs` `^0.223.0` — 위 계측에 넘기는 로그 기록기 타입입니다.
- `@opentelemetry/instrumentation`, `@opentelemetry/instrumentation-http` `^0.204.0` — `/server` 의 들어오는 요청 계측입니다.
- `web-vitals` `^6.2.3` — Web Vitals 측정입니다. 지연 로드됩니다.

### Peer dependencies

**`@opentelemetry/api` `^1.9.0` 은 반드시 프로젝트에 설치합니다.** 전역에 등록되는 API 라서 앱·Sentry·이 패키지가 같은 인스턴스 하나를 써야 서버 트레이스가 이어집니다. `pnpm why @opentelemetry/api` 로 한 벌인지 확인합니다.

나머지는 쓰는 기능에 맞춰 설치합니다.

| 패키지                                    | range         | 필요한 곳                                |
| ----------------------------------------- | ------------- | ---------------------------------------- |
| `@hyperdx/browser`                        | `>=0.26.0`    | 브라우저 tracing(`tracesSampleRate` > 0) |
| `@opentelemetry/core`                     | `>=1.30.0 <3` | `/server`, `/sentry`                     |
| `@opentelemetry/sdk-trace-base`           | `>=1.30.0 <3` | `/sentry`                                |
| `@opentelemetry/exporter-trace-otlp-http` | `>=0.57.0`    | `/sentry`                                |
| `@sentry/opentelemetry`                   | `>=9.0.0`     | `/sentry`                                |

Sentry 와 함께 쓰는 동안에는 OTel SDK 패키지의 메이저를 Sentry 에 맞춥니다(Sentry 9 → OTel 1.x, Sentry 10 → OTel 2.x).

## Installation

```bash
pnpm add @watcha-authentic/web-observability @opentelemetry/api @hyperdx/browser \
  @opentelemetry/core @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http
```

## Usage

### 브라우저 시작

진입 모듈 **최상단, hydrate 전에** 호출해야 hydration 중 오류까지 잡습니다. 값은 앱이 자기 설정(env 등)에서 읽어 넘깁니다.

```ts
import * as O11y from "@watcha-authentic/web-observability";

O11y.init({
  service: "my-app-browser",
  endpoint: "/otel", // 같은 출처 OTLP 수신 경로. 없으면 아무것도 보내지 않는다
  release: "2026.10.1",
  environment: "production",
  allowUrls: [/^https:\/\/cdn\.example\.com\/my-app\//],
  ignoreErrors: [/AbortError/],
  webVitalsSampleRate: 1,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  user: { id: "u-123" },
});
```

### 서버 시작

서버 시작 시 한 번 호출합니다. Sentry 와 함께 쓰는 동안은 `O11y.init` → `Sentry.init` → `installW3CPropagator` 순서입니다.

```ts
import * as O11y from "@watcha-authentic/web-observability";
import { instrumentIncomingHttp, createPathMatcher } from "@watcha-authentic/web-observability/server";
import { installW3CPropagator, sentryOptions } from "@watcha-authentic/web-observability/sentry";

O11y.init({
  service: "my-app",
  tracesEndpoint: "http://otel-collector:4318/v1/traces",
  tracesSampleRate: 0.1,
});
Sentry.init({ ...sentryOptions(process.env.SENTRY_DSN), integrations: [...] });
installW3CPropagator();
instrumentIncomingHttp(createPathMatcher(["/health_check"]));
```

### 로그와 오류

어디서든(브라우저·loader·서버) 같은 코드를 씁니다. 첫 인자가 문자열이면 메시지 로그, 그 밖의 값(Error 등)이면 예외 로그입니다.

```ts
try {
  await save();
} catch (error) {
  O11y.logger.error(error, { step: "save", request: { id } });
}

O11y.logger.warn("allReady 없음", { from: "render" });
```

오류 경계(React Router `ErrorBoundary`·`HydratedRouter onError` 등)가 잡은 오류는 전역 오류로 오지 않으므로 직접 남깁니다. hydration 불일치처럼 React 가 복구한 오류는 React 18.3·19 기본 동작(`reportError`)으로 전역 오류가 되어 자동으로 잡힙니다.

### 서버 배선

```ts
import {
  appendTraceparentServerTiming,
  getServerTraceparent,
  jsonAccessLog,
  routePathFromMatches,
  setServerRoute,
} from "@watcha-authentic/web-observability/server";

app.use(jsonAccessLog((req) => isUntracedPath(req.originalUrl)));

// entry.server handleRequest
const route = routePathFromMatches(routerContext.staticHandlerContext.matches);
if (route) setServerRoute(request.method, route);
appendTraceparentServerTiming(responseHeaders);

// 루트 loader — <meta name="traceparent" content={traceparent} />
const traceparent = getServerTraceparent();
```

## API

### `.` (통합 진입점)

| API                                                               | 브라우저                                                                   | 서버                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `init(options: InitOptions)`                                      | `endpoint` 가 있으면 시작. 한 번만 동작                                    | 설정을 보관하고 처리 안 된 예외·거절 보고 등록. 한 번만 동작                                 |
| `logger.debug \| info \| warn \| error(messageOrError, context?)` | 같은 출처 `{endpoint}/v1/logs` 로 OTLP 로그. 예외는 `eventName: exception` | stdout JSON 한 줄(`logger: "app"` / `"app.exception"`). error 레벨 예외는 활성 스팬에도 기록 |
| `getSessionId()`                                                  | 탭 세션 ID(`o11y.session_id`)                                              | `undefined`                                                                                  |

- `context` 는 원시값을 그대로, 그 밖의 값은 JSON 문자열(최대 1000자)로 싣습니다.
- 예외에는 `exception.type`·`exception.message`·`exception.stacktrace`(`error.cause` 연쇄 포함)가 붙습니다.
- 전역 오류(브라우저 `error`·`unhandledrejection`, 서버 처리 안 된 예외·거절)는 error 레벨 예외로 남고 `o11y.exception.source` 로 출처를 구분합니다.

### 옵션

#### `SharedOptions`

| 필드           | 타입                         | 기본값  | 설명                                                  |
| -------------- | ---------------------------- | ------- | ----------------------------------------------------- |
| `service`      | `string`                     | —       | `service.name`                                        |
| `release`      | `string`                     | —       | `service.version`                                     |
| `environment`  | `string`                     | —       | `deployment.environment.name`                         |
| `enabled`      | `boolean`                    | `true`  | false 면 아무것도 보내지 않음                         |
| `debug`        | `boolean`                    | `false` | 콘솔 진단(종착지 누락 경고, 브라우저는 레코드도 출력) |
| `sampleRate`   | `number`                     | `1`     | 예외 표본. 브라우저는 탭 세션 단위, 서버는 건 단위    |
| `ignoreErrors` | `(RegExp \| string)[]`       | —       | 메시지 또는 `타입: 메시지` 가 맞으면 예외를 버림      |
| `beforeSend`   | `(record) => record \| null` | —       | 예외 레코드의 마지막 가공·필터                        |

#### `BrowserOptions` (= `SharedOptions` +)

| 필드                       | 기본값 | 설명                                                                       |
| -------------------------- | ------ | -------------------------------------------------------------------------- |
| `endpoint`                 | —      | 같은 출처 OTLP 수신 경로. 없으면 보내지 않음                               |
| `allowUrls` / `denyUrls`   | —      | 맨 위 스택 프레임 URL 로 예외 필터                                         |
| `webVitalsSampleRate`      | `1`    | Web Vitals(LCP·INP·CLS·FCP·TTFB) 탭 세션 비율                              |
| `tracesSampleRate`         | `0.1`  | 브라우저 tracing(문서 로드·fetch 스팬, HyperDX SDK 지연 로드) 탭 세션 비율 |
| `tracePropagationTargets`  | —      | traceparent 를 실을 요청 URL                                               |
| `replaysSessionSampleRate` | `0.1`  | tracing 세션 중 세션 리플레이 비율                                         |
| `maskAllText`              | `true` | 리플레이 텍스트 마스킹(입력값은 항상 마스킹)                               |
| `ignoreUrls` / `assetUrls` | —      | tracing 에서 뺄 fetch URL / 정적 자산 URL                                  |
| `user`                     | —      | `{ id }` — 로그 `user.id`, HyperDX 세션 사용자                             |

같은 예외가 연달아 오면 한 번만, 페이지당 예외 50건·메시지 100건까지 보냅니다.

#### `ServerOptions` (= `SharedOptions` +)

| 필드                    | 기본값 | 설명                                                                      |
| ----------------------- | ------ | ------------------------------------------------------------------------- |
| `tracesEndpoint`        | —      | 서버 트레이스 OTLP/HTTP 엔드포인트. 없으면 서버 트레이스를 끔             |
| `tracesSampleRate`      | `0`    | 서버 트레이스 비율. 상위(게이트웨이)에서 샘플된 요청은 그 결정을 따름     |
| `captureUncaughtErrors` | `true` | 처리 안 된 예외·거절 보고. 다른 처리기 유무와 관계없이 종료 동작은 그대로 |

서버 로그는 stdout JSON 한 줄입니다(수집은 컨테이너 로그 수집기). `trace_id`·`span_id` 가 붙어 트레이스와 이어집니다.

### `/server`

| API                                      | 설명                                                                             |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `jsonAccessLog(skip)`                    | JSON 액세스 로그 미들웨어(express 호환). trace_id·span_id 포함, 쿼리 문자열 제외 |
| `instrumentIncomingHttp(isUntracedPath)` | 들어오는 요청 OTel HTTP 계측(나가는 요청은 계측 안 함)                           |
| `getServerTraceparent()`                 | 샘플된 요청의 traceparent(루트 loader meta 값)                                   |
| `appendTraceparentServerTiming(headers)` | 문서 응답 `Server-Timing: traceparent`(loader 를 건너뛴 응답용)                  |
| `setServerRoute(method, route)`          | 서버 스팬 이름·`http.route` 를 라우트 패턴으로                                   |
| `routePathFromMatches(matches)`          | React Router 매칭 결과 → `/:lang/search`. 루트만 매칭되면 `undefined`            |
| `createPathMatcher(prefixes)`            | 경로 접두사 판별 함수(쿼리 무시)                                                 |

### `/sentry`

Sentry(Node)가 OTel 트레이서를 쥐고 있는 동안 `init` 의 서버 설정으로 스팬을 OTLP 로 보냅니다. Sentry 를 제거하면 쓰지 않습니다.

| API                      | 설명                                                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `sentryOptions(dsn)`     | `Sentry.init` 에 펼쳐 넣는 옵션. `tracesEndpoint` 로 OTLP 처리기, Sentry 서버 트랜잭션은 버림, DSN 이 없어도 서버 트레이스는 동작 |
| `installW3CPropagator()` | `Sentry.init` 직후 호출. traceparent 가 sentry-trace 보다 우선. 등록 실패(API 여러 벌) 시 오류 로그                               |

`O11y.init` 전에 부르면 순서를 알려 주는 오류를 냅니다.

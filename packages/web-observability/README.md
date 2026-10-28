# @watcha-authentic/web-observability

SSR 서버와 브라우저의 관측 신호(트레이스·오류·Web Vitals·액세스 로그)를 OpenTelemetry 형식으로 보내는 공통 모듈입니다. 수집 백엔드는 OTLP 를 받는 OTel Collector → ClickStack(HyperDX) 구성을 기준으로 합니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=web-observability)

## Table of contents

- [Dependencies](#dependencies)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Environment variables](#environment-variables)

## Dependencies

### Runtime dependencies

이 패키지와 함께 설치됩니다.

- `@opentelemetry/browser-instrumentation` `0.9.0` — 브라우저 전역 오류(`error`·`unhandledrejection`)를 잡는 OTel 공식 계측입니다. 실험 단계(`experimental`) API라 버전을 고정합니다.
- `@opentelemetry/api-logs` `^0.223.0` — 위 계측에 로그 기록기를 넘길 때 쓰는 타입입니다.
- `web-vitals` `^6.2.3` — Web Vitals 측정입니다. 지연 로드됩니다.

### Peer dependencies

**`@opentelemetry/api` 는 프로젝트에 함께 설치해야 합니다.** OTel API 는 전역 등록 방식이라 프로젝트와 같은 인스턴스를 써야 트레이스 컨텍스트가 이어집니다.

- `@opentelemetry/api` `^1.9.0` — **Sentry 와 같은 버전(한 벌)** 이어야 합니다. 버전이 다르면 전역 등록이 거부돼 서버 트레이스 전파가 끊깁니다(`pnpm why @opentelemetry/api` 로 확인).

나머지는 쓰는 진입점에 따라 설치합니다.

| 패키지                                    | range         | 필요한 진입점                        |
| ----------------------------------------- | ------------- | ------------------------------------ |
| `@hyperdx/browser`                        | `>=0.26.0`    | `/browser` (일부 세션에서 지연 로드) |
| `@opentelemetry/core`                     | `>=1.30.0 <3` | `/server`, `/server/sentry`          |
| `@opentelemetry/sdk-trace-base`           | `>=1.30.0 <3` | `/server`, `/server/sentry`          |
| `@opentelemetry/exporter-trace-otlp-http` | `>=0.57.0`    | `/server`, `/server/sentry`          |
| `@opentelemetry/instrumentation`          | `>=0.57.0`    | `/server/http`                       |
| `@opentelemetry/instrumentation-http`     | `>=0.57.0`    | `/server/http`                       |
| `@sentry/opentelemetry`                   | `>=9.0.0`     | `/server/sentry`                     |

`/server/sentry` 를 쓰는 동안에는 OTel SDK 패키지(`core`·`sdk-trace-base`·`exporter-trace-otlp-http`)를 **Sentry 가 쓰는 OTel 과 같은 메이저**로 맞춥니다(Sentry 9 → OTel 1.x, Sentry 10 → OTel 2.x).

## Installation

```bash
pnpm add @watcha-authentic/web-observability
```

```bash
pnpm add @opentelemetry/api @hyperdx/browser \
  @opentelemetry/core @opentelemetry/sdk-trace-base @opentelemetry/exporter-trace-otlp-http
```

## Usage

### 기본: Sentry 처럼 쓰기

앱 코드는 패키지 이름 하나만 import 합니다. 브라우저·서버 어느 쪽에서 돌든 같은 이름을 쓰고, 구현은 번들러가 `browser`·`node` 조건으로 고릅니다(SSR 렌더링 중이면 서버 구현).

| Sentry                       | 이 패키지                          | 브라우저                          | 서버                             |
| ---------------------------- | ---------------------------------- | --------------------------------- | -------------------------------- |
| `Sentry.init(options)`       | `O11y.init(options)`               | RUM 시작(오류·Web Vitals·HyperDX) | 처리 안 된 예외·거절 보고 등록   |
| `Sentry.captureException(e)` | `O11y.captureException(e, attrs?)` | OTLP `exception` 로그             | 활성 스팬 기록 + JSON 로그 한 줄 |
| `Sentry.logger.warn(msg)`    | `O11y.logger.warn(msg, attrs?)`    | OTLP 로그                         | JSON 로그 한 줄                  |
| —                            | `O11y.getSessionId()`              | RUM 세션 ID                       | `undefined`                      |

```ts
import * as O11y from "@watcha-authentic/web-observability";

// 브라우저 진입점 최상단(hydrate 전) — hydration 중 오류까지 잡는다
const rum = O11y.rumOptionsFromEnv(window.__ENVS__);
if (rum) {
  O11y.init({
    ...rum,
    assetUrls: [/cdn\.example\.com/],
    errors: {
      allowUrls: [/^https:\/\/cdn\.example\.com\/my-app\//],
      ignoreErrors: [/AbortError/],
    },
    release: window.__ENVS__.SENTRY_RELEASE,
    userId: window.__SENTRY_USER__?.code,
  });
}

// 서버 시작 시(Sentry.init 을 쓰면 그 뒤)
O11y.init();

// 어디서든
try {
  await save();
} catch (error) {
  O11y.captureException(error, { "app.reason": "save" });
}
O11y.logger.warn("allReady 없음", { from: "render" });
```

아래 진입점(`/browser`·`/server`·`/server/http`·`/server/sentry`)은 진입 파일에서 한 번 연결하는 배선용입니다. 일반 코드에서는 위 통합 진입점만 씁니다.

### Browser 배선

hydration 불일치처럼 React 가 복구한 오류는 React 18.3·19 기본 동작(`reportError`)으로 전역 `error` 이벤트가 되어 자동으로 잡힙니다. `onRecoverableError` 를 덮어쓰면 이 경로가 사라지므로 덮어쓰지 않습니다.

오류 경계(React Router `ErrorBoundary` 포함)가 잡은 오류는 전역 오류로 오지 않으므로 직접 보고합니다.

```tsx
<HydratedRouter
  onError={(error) => {
    if (error instanceof Error) {
      captureException(error, { "o11y.exception.source": "react-router" });
    }
  }}
/>
```

### Server (SSR)

```ts
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

const isUntracedPath = createPathMatcher(["/health_check", "/_rx/"]);
app.use(jsonAccessLog((req) => isUntracedPath(req.originalUrl)));

// entry.server handleRequest
const route = routePathFromMatches(routerContext.staticHandlerContext.matches);
if (route) setServerRoute(request.method, route);
appendTraceparentServerTiming(responseHeaders);

// 브라우저로 넘길 RUM 설정 — SSR 이 window 전역으로 주입하는 env 객체에 펼쳐 넣는다
const envs = { ...otherEnvs, ...pickRumEnv(process.env) };

// 루트 loader: <meta name="traceparent" content={traceparent} />
const traceparent = getServerTraceparent();

// handleError
captureServerException(error, { "http.request.method": request.method });
```

### Server with Sentry (전환 기간)

Sentry 10(Node)은 OTel 트레이서를 직접 등록합니다. 그 트레이서의 스팬을 OTLP 로도 보냅니다. Sentry 를 걷어내면 이 진입점은 쓰지 않습니다.

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

## API

### `/browser`

#### `startRum(options: RumOptions): void`

세션마다 한 번 표본을 정하고(탭 단위 `sessionStorage`) 켜진 기능을 시작합니다.

- 오류 리포터: 전역 오류 + `captureException`. 기본 전체 세션.
- Web Vitals: LCP·INP·CLS·FCP·TTFB 를 OTel semconv `browser.web_vital` 이벤트로. 기본 전체 세션.
- HyperDX SDK: 브라우저 트레이스·세션 리플레이. 기본 10% 세션, 유휴 시 지연 로드. 이 SDK 의 오류·Web Vitals 수집은 끕니다(위 리포터와 중복).

신호는 모두 같은 출처 `{path}/v1/logs`(OTLP/HTTP JSON)로 쿠키 없이 보냅니다.

#### `RumOptions`

| 필드          | 타입                 | 기본값 | 설명                                                     |
| ------------- | -------------------- | ------ | -------------------------------------------------------- |
| `path`        | `string`             | —      | 같은 출처 OTLP 수신 경로 (예: `/_/rum`)                  |
| `service`     | `string`             | —      | `service.name` (예: `my-app-browser`)                    |
| `release`     | `string`             | —      | `service.version`                                        |
| `environment` | `string`             | —      | `deployment.environment.name`                            |
| `sampleRates` | `SampleRates`        | 아래   | 기능별 세션 비율                                         |
| `errors`      | `ErrorFilterOptions` | `{}`   | 오류 필터                                                |
| `maskText`    | `boolean`            | `true` | 리플레이 텍스트 마스킹(입력값은 항상 마스킹)             |
| `assetUrls`   | `RegExp[]`           | —      | 문서 로드 계측에서 뺄 정적 자산 URL                      |
| `ignoreUrls`  | `RegExp[]`           | —      | HyperDX fetch·XHR 스팬에서 뺄 URL(분석 도구는 기본 제외) |
| `userId`      | `string`             | —      | HyperDX 세션에 남길 사용자 코드                          |

#### `SampleRates`

| 필드     | 기본값 | 설명                                                    |
| -------- | ------ | ------------------------------------------------------- |
| `errors` | `1`    | 오류 리포터                                             |
| `vitals` | `1`    | Web Vitals                                              |
| `full`   | `0.1`  | HyperDX SDK                                             |
| `replay` | `0.1`  | `full` 세션 중 리플레이 비율(전체 기준 `full × replay`) |

#### `ErrorFilterOptions`

Sentry `init` 의 같은 이름 옵션과 같은 의미입니다.

| 필드           | 타입                                           | 설명                                                           |
| -------------- | ---------------------------------------------- | -------------------------------------------------------------- |
| `ignoreErrors` | `(RegExp \| string)[]`                         | 메시지 또는 `타입: 메시지` 가 맞으면 버림(문자열은 부분 일치)  |
| `denyUrls`     | `(RegExp \| string)[]`                         | 맨 위 스택 프레임 URL 이 맞으면 버림                           |
| `allowUrls`    | `(RegExp \| string)[]`                         | 맨 위 스택 프레임 URL 이 하나라도 맞아야 보냄(URL 없으면 통과) |
| `maxPerPage`   | `number`                                       | 페이지당 최대 건수. 기본 `50`                                  |
| `beforeSend`   | `(record: ErrorRecord) => ErrorRecord \| null` | 마지막 가공·필터                                               |

연달아 같은 오류(타입·메시지·스택 앞부분이 같음)는 한 번만 보냅니다. `error.cause` 연쇄는 `exception.stacktrace` 에 `Caused by:` 로 이어 붙입니다.

#### `captureException(error: unknown, attributes?: Record<string, boolean | number | string | undefined>): void`

잡은 오류를 직접 보고합니다(Sentry `captureException` 자리). 오류 리포터가 꺼진 세션이거나 `startRum` 전이면 아무것도 하지 않습니다.

Sentry 의 fingerprint·tags·contexts 는 속성으로 옮깁니다. 그룹 키는 `o11y.fingerprint` 에 둡니다.

```ts
captureException(error, {
  "o11y.fingerprint": "duplicate-locale-prefix",
  locale_prefix_bug: "true",
});
```

#### `logger.debug | info | warn | error(message: string, attributes?): void`

구조화 로그를 OTLP 로그로 보냅니다(Sentry `logger` 자리). 오류 리포터와 같은 세션 표본을 따르고, 페이지당 100건까지만 보냅니다. 오류는 `captureException` 으로 보냅니다.

#### `rumOptionsFromEnv(env: RumEnv): RumOptions | undefined`

`RUM_*` 값을 `RumOptions` 로 바꿉니다. `RUM_ENABLED` 가 `"true"` 이고 `RUM_PATH`·`RUM_SERVICE` 가 있을 때만 값을 돌려줍니다. 비율 값이 0~1 숫자가 아니면 경고를 남기고 기본값을 씁니다.

#### `getRumSessionId(): string | undefined`

RUM 세션 ID(`o11y.session_id`). Sentry 이벤트 태그 등에 붙여 신호를 잇는 데 씁니다.

### `/server`

| API                                            | 설명                                                                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `jsonAccessLog(skip)`                          | trace_id·span_id 를 포함한 구조화 JSON 액세스 로그 미들웨어(express 호환). trace_id·span_id 포함, 쿼리 문자열 제외 |
| `captureServerException(error, attributes?)`   | 활성 서버 스팬에 예외 기록 + 상태 ERROR, `exception` 이벤트 JSON 로그 한 줄                                        |
| `captureUncaughtErrors()`                      | 프로세스의 처리 안 된 예외·거절 보고(Sentry Node 기본 통합 자리). 종료 동작은 바꾸지 않음. `Sentry.init` 뒤에 호출 |
| `writeJsonLog(level, logger, message, fields)` | trace_id·span_id 를 포함한 구조화 JSON 한 줄을 stdout 으로                                                         |
| `getServerTraceparent()`                       | 샘플된 요청의 traceparent(루트 loader 의 meta 값)                                                                  |
| `appendTraceparentServerTiming(headers)`       | 문서 응답 `Server-Timing: traceparent` (loader 를 건너뛴 응답용)                                                   |
| `setServerRoute(method, route)`                | 서버 스팬 이름·`http.route` 를 라우트 패턴으로                                                                     |
| `routePathFromMatches(matches)`                | React Router 매칭 결과 → `/:lang/search`. 루트만 매칭되면 `undefined`                                              |
| `createPathMatcher(prefixes)`                  | 경로 접두사 판별 함수(쿼리 무시)                                                                                   |
| `readOtelEnv(env)`                             | `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`·`OTEL_SERVICE_NAME`·`OTEL_TRACES_SAMPLE_RATE`                                 |
| `createOtlpSpanProcessor(endpoint)`            | OTLP/HTTP 배치 스팬 처리기                                                                                         |
| `SampledTraceContextPropagator`                | 샘플된 요청에만 traceparent 를 싣는 W3C 전파기                                                                     |
| `pickRumEnv(env)`                              | 서버 env 에서 브라우저로 넘길 `RUM_*` 만 고름(`RUM_SERVICE` = `{OTEL_SERVICE_NAME}-browser`)                       |
| `isSampled`, `recordExceptionOnActiveSpan`     | 보조 함수                                                                                                          |

### `/server/http`

| API                                      | 설명                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `instrumentIncomingHttp(isUntracedPath)` | 들어오는 요청 스팬을 OTel 표준 HTTP 계측으로(나가는 요청은 계측 안 함) |

### `/server/sentry`

Sentry 와 함께 쓰는 기간의 연결 코드입니다. Sentry 를 제거하면 쓰지 않습니다.

| API                           | 설명                                                                                                                    |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `sentryOtelOptions(otel)`     | `Sentry.init` 에 펼쳐 넣는 옵션. 서버 스팬은 OTLP 로만, Sentry 서버 트랜잭션은 버림. `service.name` 을 앱 이름으로 교체 |
| `sentryDsnOptions(dsn, otel)` | DSN 이 없는 환경에서도 OTel 이 돌도록 Sentry 전송만 버림                                                                |
| `installW3CPropagator(otel)`  | `Sentry.init` 직후 호출. traceparent 가 sentry-trace 보다 우선                                                          |

### `.` (통합 진입점)

| API                                                                                                  | 설명                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init(options?: InitOptions)`                                                                        | 브라우저: `RumOptions`(수신 경로·서비스명 필수, 없으면 아무것도 안 함)로 RUM 시작. 서버: `{ captureUncaughtErrors?: boolean }`(기본 true). 한 번만 동작 |
| `captureException(error, attributes?)`                                                               | 브라우저: `/browser` `captureException`. 서버: `captureServerException`                                                                                 |
| `logger.debug \| info \| warn \| error(message, attributes?)`                                        | 브라우저: OTLP 로그. 서버: trace_id·span_id 를 포함한 구조화 JSON 한 줄(`logger: "app"`)                                                                |
| `getSessionId()`                                                                                     | 브라우저: RUM 세션 ID. 서버: `undefined`                                                                                                                |
| `rumOptionsFromEnv`, `pickRumEnv`, `parseSampleRate`, `parseTraceparent`, `formatSampledTraceparent` | 보조 함수                                                                                                                                               |

두 구현은 공개 API 가 같아야 합니다(타입은 하나로 배포). 다르면 패키지 typecheck 가 실패합니다.

## Environment variables

앱이 읽어 옵션으로 넘기는 값입니다. 비밀 값이 아니므로 배포 설정의 일반 환경 변수로 관리합니다.

| 변수                                 | 기본값 | 설명                                               |
| ------------------------------------ | ------ | -------------------------------------------------- |
| `OTEL_SERVICE_NAME`                  | —      | 서버 `service.name`. 브라우저는 `-browser` 를 붙임 |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | —      | 없으면 서버 트레이스 끔                            |
| `OTEL_TRACES_SAMPLE_RATE`            | `0`    | 서버 트레이스 비율(전환 기간 전용, 표준 변수 아님) |
| `RUM_ENABLED`                        | —      | `"true"` 일 때만 브라우저 수집                     |
| `RUM_PATH`                           | —      | 같은 출처 수신 경로                                |
| `RUM_ERRORS_SAMPLE_RATE`             | `1`    | 오류 리포터 세션 비율                              |
| `RUM_VITALS_SAMPLE_RATE`             | `1`    | Web Vitals 세션 비율                               |
| `RUM_FULL_SAMPLE_RATE`               | `0.1`  | HyperDX SDK 세션 비율                              |
| `RUM_REPLAY_SAMPLE_RATE`             | `0.1`  | full 세션 중 리플레이 비율                         |
| `RUM_MASK_TEXT`                      | `true` | `"false"` 면 리플레이 텍스트 마스킹 끔             |

# @watcha-authentic/web-observability

브라우저와 SSR 서버의 오류·로그·Web Vitals·트레이스를 OpenTelemetry 형식으로 남기는 패키지입니다. Sentry 처럼 `init` 을 한 번 호출하고, 어디서든 `logger` 로 남깁니다. 모든 기록에 `session.id`·`user.id` 가 붙어 **사용자 한 명의 흐름을 브라우저 → SSR 서버 → 백엔드까지 이어서 볼 수 있습니다.**

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=web-observability)

## 한눈에 보기

```ts
import * as O11y from "@watcha-authentic/web-observability";

// 브라우저 — 진입 모듈 최상단(hydrate 전)
O11y.init({ browser: { service: "my-app-browser", endpoint: "/otel" } });

// 서버 — 시작할 때 한 번
O11y.init({ server: { service: "my-app" } });

// 어디서든 같은 코드(브라우저·loader·서버)
O11y.logger.error(error, { step: "save" }); // 문자열이 아니면 예외 로그
O11y.logger.warn("allReady 없음"); // 문자열이면 메시지 로그
O11y.setUser({ id: user.id }); // 로그아웃하면 setUser(null)
```

- `init` 은 `{ browser }` 와 `{ server }` 중 **하나만** 받습니다. 다른 쪽 옵션이 섞이면 타입 오류가 납니다.
- 브라우저는 `endpoint` 가 없으면 아무것도 보내지 않습니다.
- 서버는 로그를 stdout JSON 으로 쓰고(수집은 컨테이너 로그 수집기), 트레이스만 OTLP 로 보냅니다.

## 사용자 흐름 추적

**`user.id` → `session.id` → `trace_id` 순서로 좁혀 갑니다.**

| ID           | 단위                       | 붙는 곳                                                                      |
| ------------ | -------------------------- | ---------------------------------------------------------------------------- |
| `user.id`    | 사람 한 명(여러 세션)      | `setUser` 이후의 로그. 브라우저 tracing 스팬은 `userId`(HyperDX 세션 사용자) |
| `session.id` | 브라우저 세션(탭끼리 공유) | 브라우저 로그·Web Vitals·tracing 스팬, 서버 로그·서버 스팬                   |
| `trace_id`   | 요청 하나                  | 서버 로그·스팬, 브라우저 tracing 스팬                                        |

1. `user.id` 로 그 사용자의 `session.id` 를 찾습니다.
2. `session.id` 로 그 세션의 브라우저·서버 로그와 스팬을 시간순으로 봅니다.
3. 자세히 볼 요청은 `trace_id` 로 브라우저 → SSR → 백엔드 트레이스 전체를 엽니다.

서버의 `user.id` 는 `setUser` 를 부른 요청(보통 문서 요청)에만 붙습니다. 같은 세션의 다른 요청은 `session.id` 로 이어집니다.

### 세션 ID 는 이렇게 정해집니다

- 서버의 `sessionContext` 가 `o11y_sid` 쿠키를 읽고, 없으면 만들어 응답에 내립니다. 만료 시각이 없는 세션 쿠키라 브라우저를 닫으면 사라지고, 같은 브라우저의 탭끼리 공유합니다.
- 브라우저는 이 쿠키 값을 그대로 씁니다. 그래서 첫 SSR 요청부터 서버와 브라우저 기록이 같은 `session.id` 로 묶입니다.
- 쿠키가 없으면(서버에 `sessionContext` 를 연결하지 않았거나 쿠키가 막힌 경우) 브라우저는 탭마다 따로 만든 ID 를 씁니다. 이때는 서버 기록과 이어지지 않습니다.
- `getSessionId()` 는 브라우저에서는 이 값을, 서버에서는 지금 처리 중인 요청의 값을 돌려줍니다(요청 밖이면 `undefined`).

### 트레이스가 백엔드까지 이어지려면

- 브라우저 `tracePropagationTargets` 에 API 주소를 넣어야 요청에 `traceparent` 가 실립니다. 기본값은 비어 있습니다.
- 백엔드가 OpenTelemetry 로 `traceparent` 를 이어받아 같은 수집기로 보내야 합니다. 다른 도메인 API 라면 CORS 에서 `traceparent` 헤더를 허용해야 합니다.
- 트레이스는 표본만 남습니다. 브라우저는 탭마다 `tracesSampleRate`(기본 10%) 로 정하고, 표본이 된 탭의 요청은 백엔드도 그 결정을 따라 끝까지 남깁니다.

## 설치

```bash
pnpm add @watcha-authentic/web-observability @opentelemetry/api
```

**`@opentelemetry/api` 는 프로젝트에 한 버전만 있어야 합니다.** 앱·Sentry·이 패키지가 같은 인스턴스를 써야 서버 트레이스가 이어집니다. `pnpm why @opentelemetry/api` 에 버전이 하나만 나오는지 확인합니다.

쓰는 기능에 따라 추가로 설치합니다.

| 패키지                                    | 버전          | 필요한 경우                              |
| ----------------------------------------- | ------------- | ---------------------------------------- |
| `@hyperdx/browser`                        | `>=0.26.0`    | 브라우저 tracing(`tracesSampleRate` > 0) |
| `@opentelemetry/core`                     | `>=1.30.0 <3` | `/server`, `/sentry`                     |
| `@opentelemetry/sdk-trace-base`           | `>=1.30.0 <3` | `/sentry`                                |
| `@opentelemetry/exporter-trace-otlp-http` | `>=0.57.0`    | `/sentry`                                |
| `@sentry/opentelemetry`                   | `>=9.0.0`     | `/sentry`                                |

Sentry 와 함께 쓰는 동안 OTel SDK 메이저는 Sentry 에 맞춥니다(Sentry 9 → OTel 1.x, Sentry 10 → OTel 2.x).

## 브라우저 설정

진입 모듈 최상단, hydrate 전에 호출합니다. 그래야 hydration 중 오류까지 잡습니다.

```ts
O11y.init({
  browser: {
    service: "my-app-browser",
    endpoint: "/otel", // 같은 출처의 OTLP 수신 경로
    tracePropagationTargets: [/^https:\/\/api\.example\.com\//],
    user: initialUser && { id: initialUser.id }, // 이후 바뀌면 setUser
  },
});
```

오류 경계(`ErrorBoundary`·`HydratedRouter onError`)가 잡은 오류는 자동으로 남지 않으므로 `logger.error` 로 직접 남깁니다.

## 서버 설정

**호출 순서가 중요합니다.** `O11y.init` → `Sentry.init` → `installW3CPropagator` → `instrumentIncomingHttp` 순서로 부르고, 미들웨어는 `sessionContext` → `jsonAccessLog` 순서로 연결합니다. `O11y.init` 전에 `/sentry` 를 부르면 오류가 납니다.

```ts
import * as O11y from "@watcha-authentic/web-observability";
import {
  appendTraceparentServerTiming,
  createPathMatcher,
  getServerTraceparent,
  instrumentIncomingHttp,
  jsonAccessLog,
  routePathFromMatches,
  sessionContext,
  setServerRoute,
} from "@watcha-authentic/web-observability/server";
import { installW3CPropagator, sentryOptions } from "@watcha-authentic/web-observability/sentry";

const isUntracedPath = createPathMatcher(["/health_check"]);

// 1. 시작
O11y.init({
  server: {
    service: "my-app",
    tracesEndpoint: "http://otel-collector:4318/v1/traces",
    tracesSampleRate: 0.1,
  },
});
Sentry.init({ ...sentryOptions(process.env.SENTRY_DSN), integrations: [...] });
installW3CPropagator();
instrumentIncomingHttp(isUntracedPath);

// 2. 미들웨어 — sessionContext 가 먼저여야 액세스 로그에도 session.id·user.id 가 남습니다
app.use(sessionContext((req) => isUntracedPath(req.originalUrl)));
app.use(jsonAccessLog((req) => isUntracedPath(req.originalUrl)));

// 3. entry.server handleRequest
const route = routePathFromMatches(routerContext.staticHandlerContext.matches);
if (route) setServerRoute(request.method, route);
appendTraceparentServerTiming(responseHeaders);
if (session) O11y.setUser({ id: String(session.id) }); // 이미 가져온 세션 값으로. 추가 요청 없음

// 4. 루트 loader — <meta name="traceparent" content={traceparent} />
const traceparent = getServerTraceparent();
```

| 단계                            | 하는 일                                                   |
| ------------------------------- | --------------------------------------------------------- |
| `sessionContext`                | `session.id` 를 정하고 요청 로그·서버 스팬에 붙임         |
| `jsonAccessLog`                 | 요청마다 액세스 로그 한 줄(쿼리 문자열 제외)              |
| `setServerRoute`                | 서버 스팬 이름을 `GET /:lang/search` 같은 라우트 패턴으로 |
| `appendTraceparentServerTiming` | 404·500 응답도 브라우저가 SSR 트레이스에 이어지게 함      |
| `getServerTraceparent`          | 문서의 `<meta name="traceparent">` 값(샘플된 요청만)      |
| `setUser`                       | 이 요청의 로그에 `user.id`. 인증 쿠키 값은 넣지 않습니다  |

## 옵션

`init({ browser: {...} })` 또는 `init({ server: {...} })` 안에 넣습니다. 공통 옵션은 양쪽 모두에 쓸 수 있습니다.

### 공통

| 필드                    | 기본값  | 설명                                                                                                         |
| ----------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `service`               | 필수    | `service.name`                                                                                               |
| `release`               | —       | `service.version`                                                                                            |
| `environment`           | —       | `deployment.environment.name`                                                                                |
| `enabled`               | `true`  | `false` 면 아무것도 보내지 않음                                                                              |
| `debug`                 | `false` | 콘솔 진단                                                                                                    |
| `sampleRate`            | `1`     | 예외 표본. 브라우저는 탭 단위, 서버는 건 단위                                                                |
| `ignoreErrors`          | —       | 메시지 또는 `타입: 메시지` 가 맞으면 버림(문자열은 부분 일치)                                                |
| `beforeSend`            | —       | 예외 레코드 가공·필터. `null` 을 돌려주면 버림                                                               |
| `captureUncaughtErrors` | `true`  | 처리 안 된 예외·거절. 브라우저는 `error`·`unhandledrejection`, 서버는 프로세스 예외·거절(종료 동작은 그대로) |

### 브라우저

| 필드                       | 기본값 | 설명                                                 |
| -------------------------- | ------ | ---------------------------------------------------- |
| `endpoint`                 | —      | 같은 출처 OTLP 수신 경로. 없으면 보내지 않음         |
| `tracePropagationTargets`  | —      | `traceparent` 를 실을 요청 URL(백엔드 트레이스 연결) |
| `tracesSampleRate`         | `0.1`  | 브라우저 tracing(HyperDX SDK 지연 로드) 탭 비율      |
| `replaysSessionSampleRate` | `0.1`  | tracing 탭 중 세션 리플레이 비율                     |
| `webVitalsSampleRate`      | `1`    | Web Vitals 탭 비율                                   |
| `user`                     | —      | `{ id }` — 처음 사용자. 이후에는 `setUser`           |
| `allowUrls` / `denyUrls`   | —      | 맨 위 스택 프레임 URL 로 예외 필터                   |
| `ignoreUrls` / `assetUrls` | —      | tracing 에서 뺄 fetch URL / 정적 자산 URL            |
| `maskAllText`              | `true` | 리플레이 텍스트 마스킹(입력값은 항상 마스킹)         |

페이지당 예외 50건·메시지 100건까지 보내고, 같은 예외가 연달아 오면 한 번만 보냅니다.

### 서버

| 필드               | 기본값 | 설명                                                                      |
| ------------------ | ------ | ------------------------------------------------------------------------- |
| `tracesEndpoint`   | —      | 서버 트레이스 OTLP/HTTP 주소. 없으면 서버 트레이스를 끔                   |
| `tracesSampleRate` | `0`    | 서버가 스스로 정하는 트레이스 비율. 상위에서 샘플된 요청은 그 결정을 따름 |

## 진입점

| 경로      | 쓰는 곳              | 내용                                                                                      |
| --------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `.`       | 앱 코드 전반         | `init`·`logger`·`setUser`·`getSessionId`. 번들러가 브라우저·서버 구현을 자동으로 고릅니다 |
| `/server` | 서버 진입 파일       | 세션·액세스 로그·traceparent·라우트·HTTP 계측                                             |
| `/sentry` | Sentry 병행 기간에만 | Sentry 트레이서의 스팬을 OTLP 로 보냅니다. Sentry 를 걷어내면 지웁니다                    |

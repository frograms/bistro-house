# @watcha-authentic/web-observability

브라우저와 SSR 서버의 오류·로그·Web Vitals·트레이스를 OpenTelemetry 형식으로 보냅니다. Sentry 처럼 `init` 을 한 번 호출하고, 어디서든 `logger` 로 남깁니다.

릴리즈: [CHANGELOG](./CHANGELOG.md) · [GitHub Releases](https://github.com/frograms/bistro-house/releases?q=web-observability)

## 빠른 시작

```ts
import * as O11y from "@watcha-authentic/web-observability";

// 브라우저: 진입 모듈 최상단, hydrate 전에 호출해야 hydration 중 오류까지 잡습니다
O11y.init({ service: "my-app-browser", endpoint: "/otel" });

// 서버: 시작 시 한 번
O11y.init({ service: "my-app" });

// 어디서든(브라우저·loader·서버) 같은 코드
O11y.logger.error(error, { step: "save" }); // 문자열이 아니면 예외 로그
O11y.logger.warn("allReady 없음"); // 문자열이면 메시지 로그
```

- 브라우저는 `endpoint` 가 없으면 아무것도 보내지 않습니다.
- 오류 경계(`ErrorBoundary`·`HydratedRouter onError`)가 잡은 오류는 자동으로 잡히지 않으므로 `logger.error` 로 직접 남깁니다.

## 설치

```bash
pnpm add @watcha-authentic/web-observability @opentelemetry/api
```

**`@opentelemetry/api` 는 프로젝트에 한 버전만 설치되어 있어야 합니다.** 앱·Sentry·이 패키지가 같은 인스턴스를 써야 서버 트레이스가 이어집니다. `pnpm why @opentelemetry/api` 결과에 버전이 하나만 나오는지 확인합니다.

쓰는 기능에 따라 추가로 설치합니다.

| 패키지                                    | range         | 필요한 곳                                |
| ----------------------------------------- | ------------- | ---------------------------------------- |
| `@hyperdx/browser`                        | `>=0.26.0`    | 브라우저 tracing(`tracesSampleRate` > 0) |
| `@opentelemetry/core`                     | `>=1.30.0 <3` | `/server`, `/sentry`                     |
| `@opentelemetry/sdk-trace-base`           | `>=1.30.0 <3` | `/sentry`                                |
| `@opentelemetry/exporter-trace-otlp-http` | `>=0.57.0`    | `/sentry`                                |
| `@sentry/opentelemetry`                   | `>=9.0.0`     | `/sentry`                                |

Sentry 와 함께 쓰는 동안 OTel SDK 메이저는 Sentry 에 맞춥니다(Sentry 9 → OTel 1.x, Sentry 10 → OTel 2.x).

## 진입점

| 경로      | 쓰는 곳              | 내용                                                                            |
| --------- | -------------------- | ------------------------------------------------------------------------------- |
| `.`       | 앱 코드 전반         | `init`·`logger`·`getSessionId`. 번들러가 브라우저·서버 구현을 자동으로 고릅니다 |
| `/server` | 서버 진입 파일       | 액세스 로그·traceparent·라우트·HTTP 계측 배선                                   |
| `/sentry` | Sentry 병행 기간에만 | Sentry 트레이서의 스팬을 OTLP 로 보냅니다. Sentry 를 걷어내면 지웁니다          |

## 서버 배선

호출 순서가 중요합니다: `O11y.init` → `Sentry.init` → `installW3CPropagator` → `instrumentIncomingHttp`. `O11y.init` 전에 `/sentry` 를 부르면 오류가 납니다.

```ts
import * as O11y from "@watcha-authentic/web-observability";
import {
  appendTraceparentServerTiming,
  createPathMatcher,
  getServerTraceparent,
  instrumentIncomingHttp,
  jsonAccessLog,
  routePathFromMatches,
  setServerRoute,
} from "@watcha-authentic/web-observability/server";
import { installW3CPropagator, sentryOptions } from "@watcha-authentic/web-observability/sentry";

const isUntracedPath = createPathMatcher(["/health_check"]);

O11y.init({
  service: "my-app",
  tracesEndpoint: "http://otel-collector:4318/v1/traces",
  tracesSampleRate: 0.1,
});
Sentry.init({ ...sentryOptions(process.env.SENTRY_DSN), integrations: [...] });
installW3CPropagator();
instrumentIncomingHttp(isUntracedPath);

app.use(jsonAccessLog((req) => isUntracedPath(req.originalUrl)));

// entry.server handleRequest
const route = routePathFromMatches(routerContext.staticHandlerContext.matches);
if (route) setServerRoute(request.method, route);
appendTraceparentServerTiming(responseHeaders);

// 루트 loader — <meta name="traceparent" content={traceparent} />
const traceparent = getServerTraceparent();
```

## 옵션

### 공통

| 필드           | 기본값  | 설명                                                          |
| -------------- | ------- | ------------------------------------------------------------- |
| `service`      | 필수    | `service.name`                                                |
| `release`      | —       | `service.version`                                             |
| `environment`  | —       | `deployment.environment.name`                                 |
| `enabled`      | `true`  | `false` 면 아무것도 보내지 않음                               |
| `debug`        | `false` | 콘솔 진단                                                     |
| `sampleRate`   | `1`     | 예외 표본. 브라우저는 탭 세션 단위, 서버는 건 단위            |
| `ignoreErrors` | —       | 메시지 또는 `타입: 메시지` 가 맞으면 버림(문자열은 부분 일치) |
| `beforeSend`   | —       | 예외 레코드 가공·필터. `null` 을 돌려주면 버림                |

### 브라우저

| 필드                       | 기본값 | 설명                                                 |
| -------------------------- | ------ | ---------------------------------------------------- |
| `endpoint`                 | —      | 같은 출처 OTLP 수신 경로. 없으면 보내지 않음         |
| `allowUrls` / `denyUrls`   | —      | 맨 위 스택 프레임 URL 로 예외 필터                   |
| `webVitalsSampleRate`      | `1`    | Web Vitals 탭 세션 비율                              |
| `tracesSampleRate`         | `0.1`  | 브라우저 tracing(HyperDX SDK 지연 로드) 탭 세션 비율 |
| `tracePropagationTargets`  | —      | traceparent 를 실을 요청 URL                         |
| `replaysSessionSampleRate` | `0.1`  | tracing 세션 중 세션 리플레이 비율                   |
| `maskAllText`              | `true` | 리플레이 텍스트 마스킹(입력값은 항상 마스킹)         |
| `ignoreUrls` / `assetUrls` | —      | tracing 에서 뺄 fetch URL / 정적 자산 URL            |
| `user`                     | —      | `{ id }` — 로그 `user.id`, HyperDX 세션 사용자       |

페이지당 예외 50건·메시지 100건까지 보내고, 같은 예외가 연달아 오면 한 번만 보냅니다.

### 서버

| 필드                    | 기본값 | 설명                                                        |
| ----------------------- | ------ | ----------------------------------------------------------- |
| `tracesEndpoint`        | —      | 서버 트레이스 OTLP/HTTP 엔드포인트. 없으면 서버 트레이스 끔 |
| `tracesSampleRate`      | `0`    | 서버 트레이스 비율. 상위에서 샘플된 요청은 그 결정을 따름   |
| `captureUncaughtErrors` | `true` | 처리 안 된 예외·거절 보고. 프로세스 종료 동작은 바꾸지 않음 |

서버 로그는 `trace_id`·`span_id` 가 붙은 stdout JSON 한 줄이며, 수집은 컨테이너 로그 수집기가 맡습니다.

import type { SpanContext } from "@opentelemetry/api";
import { trace } from "@opentelemetry/api";

import { recordExceptionOnActiveSpan } from "./trace.ts";

type LogLevel = "debug" | "error" | "info" | "warn";
type LogValue = boolean | number | string | undefined;

/** trace_id·span_id 를 포함한 구조화 JSON 한 줄을 stdout 으로 쓴다(수집은 컨테이너 로그 수집기가 맡는다) */
export function writeJsonLog(
  level: LogLevel,
  logger: string,
  message: string,
  fields: Record<string, LogValue>,
  spanContext: SpanContext | undefined = trace.getActiveSpan()?.spanContext()
) {
  process.stdout.write(
    `${JSON.stringify({
      /* eslint-disable camelcase -- 로그 수집기가 읽는 필드명(trace_id·span_id) */
      level,
      logger,
      message,
      span_id: spanContext?.spanId,
      timestamp: new Date().toISOString(),
      trace_id: spanContext?.traceId,
      /* eslint-enable camelcase */
      ...fields,
    })}\n`
  );
}

function stackWithCauses(error: Error) {
  let stack = error.stack ?? `${error.name}: ${error.message}`;
  let { cause } = error;
  for (let depth = 0; cause !== undefined && depth < 5; depth++) {
    stack += `\nCaused by: ${cause instanceof Error ? (cause.stack ?? cause.message) : String(cause)}`;
    cause = cause instanceof Error ? cause.cause : undefined;
  }
  return stack;
}

/**
 * 서버 오류를 보고한다(Sentry `captureException` 자리).
 * - 활성 서버 스팬: `recordException` + 상태 ERROR
 * - 로그: `exception` 이벤트 JSON 한 줄(trace_id·span_id 포함, OTel semconv `exception.*`)
 */
export function captureServerException(
  error: unknown,
  attributes: Record<string, LogValue> = {}
) {
  const spanContext =
    recordExceptionOnActiveSpan(error) ?? trace.getActiveSpan()?.spanContext();
  const isError = error instanceof Error;
  const message = isError ? error.message : String(error);
  writeJsonLog(
    "error",
    "app.exception",
    message,
    {
      "event.name": "exception",
      "exception.message": message,
      "exception.stacktrace": isError ? stackWithCauses(error) : undefined,
      "exception.type": isError ? error.name : typeof error,
      ...attributes,
    },
    spanContext
  );
}

/**
 * 프로세스에서 처리되지 않은 오류를 보고한다(Sentry Node 의 onUncaughtException·onUnhandledRejection 자리).
 * 프로세스 동작(종료 여부)은 바꾸지 않는다.
 * - 처리 안 된 예외: `uncaughtExceptionMonitor` 로만 듣는다(일반 리스너를 달면 Node 가 종료하지 않게 된다)
 * - 처리 안 된 거절: 이미 리스너가 있으면(Sentry 등) 거절이 예외로 바뀌지 않으므로 그때만 같이 듣는다.
 *   리스너가 없으면 Node 기본 동작으로 예외가 되어 위 monitor 에 온다.
 * `Sentry.init` 등 다른 처리기 등록 뒤에 호출한다.
 */
export function captureUncaughtErrors() {
  process.on("uncaughtExceptionMonitor", (error, origin) => {
    captureServerException(error, { "o11y.exception.source": origin });
  });
  if (process.listenerCount("unhandledRejection") > 0) {
    process.on("unhandledRejection", (reason) => {
      captureServerException(reason, {
        "o11y.exception.source": "unhandledRejection",
      });
    });
  }
}

/** express 와 맞는 최소 타입(express 를 의존성으로 두지 않는다) */
type AccessLogRequest = {
  get(name: string): string | undefined;
  method: string;
  originalUrl: string;
};
type AccessLogResponse = {
  headersSent: boolean;
  once(event: "close" | "finish", listener: () => void): unknown;
  statusCode: number;
};

function accessLogLevel(status: number | undefined): LogLevel {
  if (status === undefined) {
    return "warn";
  }
  return status >= 500 ? "error" : "info";
}

/**
 * trace_id·span_id 를 포함한 구조화 JSON 액세스 로그 미들웨어(쿼리 문자열 제외).
 * 진입 시점의 서버 스팬을 기억해 응답 종료 후에도 trace_id·span_id 를 남긴다.
 */
export function jsonAccessLog<
  Req extends AccessLogRequest,
  Res extends AccessLogResponse,
>(skip: (req: Req) => boolean) {
  return (req: Req, res: Res, next: () => void) => {
    if (skip(req)) {
      next();
      return;
    }
    const spanContext = trace.getActiveSpan()?.spanContext();
    const start = process.hrtime.bigint();
    let logged = false;
    // 응답 헤더를 보내기 전에 연결이 끊기면 상태 없이 aborted 로 남긴다(기존 morgan 형식과 같다)
    const log = () => {
      if (logged) {
        return;
      }
      logged = true;
      const status = res.headersSent ? res.statusCode : undefined;
      const path = req.originalUrl.split("?")[0] ?? req.originalUrl;
      const duration = Number(process.hrtime.bigint() - start) / 1e6;
      writeJsonLog(
        accessLogLevel(status),
        "http.access",
        `${req.method} ${path} ${status ?? "aborted"}`,
        {
          "event.name": "http.server.request",
          "http.request.method": req.method,
          "http.response.status_code": status,
          "http.server.request.duration_ms": Math.round(duration * 1000) / 1000,
          "url.path": path,
          "user_agent.original": req.get("user-agent"),
        },
        spanContext
      );
    };
    res.once("finish", log);
    res.once("close", log);
    next();
  };
}

import type { SpanContext } from "@opentelemetry/api";
import { trace } from "@opentelemetry/api";

import type {
  Attributes,
  Context,
  Logger,
} from "../../type/observability-types.ts";
import {
  contextAttributes,
  exceptionAttributes,
  isIgnoredError,
} from "../../util/attribute-utils.ts";
import { getServerConfig } from "./server-config.ts";
import { recordExceptionOnActiveSpan } from "./server-span.ts";

type Level = keyof Logger;

/** trace_id·span_id 를 포함한 구조화 JSON 한 줄을 stdout 으로 쓴다(수집은 컨테이너 로그 수집기가 맡는다) */
export function writeJsonLog(
  level: Level,
  logger: string,
  message: string,
  fields: Attributes,
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

/**
 * 서버 로그. 문자열이면 메시지 로그(`logger: "app"`), 그 밖의 값이면 예외 로그(`logger: "app.exception"`).
 * error 레벨 예외는 활성 서버 스팬에도 `recordException` + 상태 ERROR 로 남긴다.
 * `init` 전에도 동작한다(설정이 없으면 기본값).
 */
export function writeServerLog(
  level: Level,
  messageOrError: unknown,
  context: Context = {},
  asException = false
) {
  const config = getServerConfig();
  if (config?.enabled === false) {
    return;
  }
  // 처리 안 된 예외·거절은 이유가 문자열이어도 예외로 남긴다
  if (!asException && typeof messageOrError === "string") {
    writeJsonLog(level, "app", messageOrError, contextAttributes(context));
    return;
  }
  if (Math.random() >= (config?.sampleRate ?? 1)) {
    return;
  }
  let record = {
    attributes: {
      "event.name": "exception",
      ...exceptionAttributes(messageOrError),
      ...contextAttributes(context),
    } as Attributes,
    error: messageOrError,
  };
  if (isIgnoredError(record.attributes, config?.ignoreErrors)) {
    return;
  }
  if (config?.beforeSend) {
    const result = config.beforeSend(record);
    if (!result) {
      return;
    }
    record = result;
  }
  const spanContext =
    (level === "error"
      ? recordExceptionOnActiveSpan(messageOrError)
      : undefined) ?? trace.getActiveSpan()?.spanContext();
  writeJsonLog(
    level,
    "app.exception",
    String(record.attributes["exception.message"] ?? "exception"),
    record.attributes,
    spanContext
  );
}

const REPORTED = Symbol.for("@watcha-authentic/web-observability/reported");

function markReported(error: unknown) {
  if (typeof error === "object" && error !== null) {
    (error as Record<symbol, boolean>)[REPORTED] = true;
  }
}

function wasReported(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as Record<symbol, boolean>)[REPORTED] === true
  );
}

/** `--unhandled-rejections` 모드. 지정이 없으면 Node 기본(throw) */
function unhandledRejectionsMode() {
  const flags = [
    ...process.execArgv,
    ...(process.env.NODE_OPTIONS ?? "").split(/\s+/),
  ];
  const flag = flags.find((arg) => arg.startsWith("--unhandled-rejections="));
  return flag?.split("=")[1] ?? "throw";
}

/**
 * 프로세스에서 처리되지 않은 오류를 보고한다(Sentry Node 의 onUncaughtException·onUnhandledRejection 자리).
 * 다른 처리기(Sentry 등)를 앞뒤 어느 쪽에 등록해도 프로세스 동작(종료 여부)은 바꾸지 않는다.
 * - 처리 안 된 예외: `uncaughtExceptionMonitor` 로만 듣는다(일반 리스너를 달면 Node 가 종료하지 않게 된다)
 * - 처리 안 된 거절: 리스너를 달면 Node 기본 동작(예외로 바꿔 종료)이 사라지므로,
 *   거절 시점에 다른 리스너가 없으면 Node 기본(`throw` 모드)처럼 예외로 다시 던진다
 */
export function captureUncaughtErrors() {
  process.on("uncaughtExceptionMonitor", (error, origin) => {
    if (!wasReported(error)) {
      writeServerLog("error", error, { "o11y.exception.source": origin }, true);
    }
  });
  process.on("unhandledRejection", (reason) => {
    writeServerLog(
      "error",
      reason,
      { "o11y.exception.source": "unhandledRejection" },
      true
    );
    if (
      process.listenerCount("unhandledRejection") === 1 &&
      unhandledRejectionsMode() === "throw"
    ) {
      const error =
        reason instanceof Error
          ? reason
          : Object.assign(
              new Error(
                `This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason "${String(reason)}".`
              ),
              { code: "ERR_UNHANDLED_REJECTION" }
            );
      markReported(error);
      throw error;
    }
  });
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

function accessLogLevel(status: number | undefined): Level {
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

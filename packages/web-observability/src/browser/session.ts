import type { BrowserOptions } from "../options.ts";

export type SessionFlags = {
  /** 예외 레코드 */
  errors: boolean;
  /** 세션 리플레이(tracing 세션 안에서만) */
  replay: boolean;
  sid: string;
  /** 브라우저 tracing(HyperDX SDK) */
  tracing: boolean;
  vitals: boolean;
};

const STORAGE_KEY = "o11y_session";

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readFlags(): SessionFlags | undefined {
  try {
    const flags: unknown = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? "null"
    );
    if (
      typeof flags === "object" &&
      flags !== null &&
      "sid" in flags &&
      typeof flags.sid === "string"
    ) {
      const read = (key: keyof SessionFlags) =>
        key in flags && (flags as Record<string, unknown>)[key] === true;
      return {
        errors: read("errors"),
        replay: read("replay"),
        sid: flags.sid,
        tracing: read("tracing"),
        vitals: read("vitals"),
      };
    }
  } catch {
    // sessionStorage 를 쓸 수 없으면 페이지 단위로 판정한다
  }
  return undefined;
}

/** 탭 세션마다 한 번 판정해 sessionStorage 에 둔다(같은 탭 안에서는 유지) */
export function sessionFlags(options: BrowserOptions): SessionFlags {
  const saved = readFlags();
  if (saved) {
    return saved;
  }
  const tracing = Math.random() < (options.tracesSampleRate ?? 0.1);
  const flags: SessionFlags = {
    errors: Math.random() < (options.sampleRate ?? 1),
    replay:
      tracing && Math.random() < (options.replaysSessionSampleRate ?? 0.1),
    sid: randomId(),
    tracing,
    vitals: Math.random() < (options.webVitalsSampleRate ?? 1),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // 저장 실패는 무시한다
  }
  return flags;
}

export function getSessionId() {
  return readFlags()?.sid;
}

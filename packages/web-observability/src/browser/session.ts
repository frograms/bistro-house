export type SampleRates = {
  /** 오류 리포터. 기본 1 — 오류는 표본이 아니라 한 건 한 건이 의미가 있다 */
  errors?: number;
  /** HyperDX SDK(브라우저 트레이스). 기본 0.1 */
  full?: number;
  /** 세션 리플레이 — full 세션 중 비율(전체 세션 기준은 full × replay). 기본 0.1 */
  replay?: number;
  /** 경량 Web Vitals 리포터. 기본 1 */
  vitals?: number;
};

export type SessionFlags = {
  errors: boolean;
  full: boolean;
  replay: boolean;
  sid: string;
  vitals: boolean;
};

const STORAGE_KEY = "o11y_rum";

function randomId() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function readFlag(flags: object, key: keyof SessionFlags) {
  return key in flags && (flags as Record<string, unknown>)[key] === true;
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
      return {
        // 오류 플래그가 없는 이전 저장값은 오류 수집을 켠 것으로 본다
        errors: "errors" in flags ? readFlag(flags, "errors") : true,
        full: readFlag(flags, "full"),
        replay: readFlag(flags, "replay"),
        sid: flags.sid,
        vitals: readFlag(flags, "vitals"),
      };
    }
  } catch {
    // sessionStorage 를 쓸 수 없으면 페이지 단위로 판정한다
  }
  return undefined;
}

/** 탭 세션마다 한 번 판정해 sessionStorage 에 둔다(같은 탭 안에서는 유지) */
export function sessionFlags(rates: SampleRates): SessionFlags {
  const saved = readFlags();
  if (saved) {
    return saved;
  }
  const full = Math.random() < (rates.full ?? 0.1);
  const flags: SessionFlags = {
    errors: Math.random() < (rates.errors ?? 1),
    full,
    replay: full && Math.random() < (rates.replay ?? 0.1),
    sid: randomId(),
    vitals: Math.random() < (rates.vitals ?? 1),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  } catch {
    // 저장 실패는 무시한다
  }
  return flags;
}

export function getRumSessionId() {
  return readFlags()?.sid;
}

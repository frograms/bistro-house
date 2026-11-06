type FeatureChecks = Record<string, () => boolean>;

/* 없으면 바로 깨지는 것만 보기 */
export const CORE_FEATURES: FeatureChecks = {
  fetch: () => typeof window.fetch === "function",
  Headers: () => typeof Headers === "function",
  Map: () => typeof Map === "function",
  Promise: () => typeof Promise === "function",
  Response: () => typeof Response === "function",
  Set: () => typeof Set === "function",
  TextDecoder: () => typeof TextDecoder === "function",
  TextEncoder: () => typeof TextEncoder === "function",
};

export const PANEL_FEATURES: FeatureChecks = {
  MutationObserver: () => typeof MutationObserver === "function",
  requestAnimationFrame: () =>
    typeof window.requestAnimationFrame === "function",
};

export const findMissingFeatures = (checks: FeatureChecks): string[] =>
  Object.keys(checks).filter((name) => {
    try {
      return !checks[name]?.();
    } catch {
      return true;
    }
  });

export const warnHttpOverride = (message: string, detail?: unknown): void => {
  const text = `[react-http-override] ${message}`;
  if (detail === undefined) console.warn(text);
  else console.warn(text, detail);
};

export const unsupportedMessage = (what: string, missing: string[]): string =>
  `이 환경에서는 ${what} 실행할 수 없어 건너뜁니다. 없는 기능: ${missing.join(", ")}`;

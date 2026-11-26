import diagnosticsChannel from "node:diagnostics_channel";

import { getServerConfig } from "./server-config.ts";

/** 클러스터 내부 호스트 — mesh 직결 private 호스트와 Service 주소 */
const DEFAULT_TARGETS: readonly (RegExp | string)[] = [
  /^private-/,
  /\.svc\.cluster\.local$/,
];
const HEADER = "x-request-id";
// 통합 진입점(.)과 /server 가 다른 번들 청크로 로드돼도 한 번만 구독한다
const SUBSCRIBED_KEY = Symbol.for(
  "@watcha-authentic/web-observability/request-id-forward"
);

/** `undici:request:create` 메시지의 요청(Node 내장 fetch) — 필요한 필드만 */
type UndiciRequest = {
  addHeader(name: string, value: string): unknown;
  headers: string | (string | string[])[];
  origin: string | URL;
};

function hasHeader(headers: UndiciRequest["headers"], name: string) {
  if (Array.isArray(headers)) {
    return headers.some(
      (value, index) =>
        index % 2 === 0 &&
        typeof value === "string" &&
        value.toLowerCase() === name
    );
  }
  return headers.toLowerCase().includes(`${name}:`);
}

function isTarget(hostname: string, targets: readonly (RegExp | string)[]) {
  return targets.some((target) =>
    typeof target === "string" ? target === hostname : target.test(hostname)
  );
}

/**
 * 요청 처리 중 나가는 fetch 에 들어온 `x-request-id` 를 싣는다(대상 호스트만, 이미 있으면 그대로).
 * Istio(Envoy)는 이 값에 담긴 추적 결정으로 다음 홉의 기록 여부를 정하므로, 넘기지 않으면 사이드카가 다시 뽑아 trace 가 끊긴다.
 * Node 내장 fetch(undici)만 다룬다 — `node:http` 직접 호출은 대상이 아니다.
 */
export function forwardRequestId(
  getStore: () => { requestId?: string } | undefined
) {
  const holder = globalThis as { [SUBSCRIBED_KEY]?: boolean };
  if (holder[SUBSCRIBED_KEY]) {
    return;
  }
  holder[SUBSCRIBED_KEY] = true;
  diagnosticsChannel.subscribe("undici:request:create", (message) => {
    const { request } = message as { request: UndiciRequest };
    const requestId = getStore()?.requestId;
    if (!requestId || hasHeader(request.headers, HEADER)) {
      return;
    }
    let hostname: string;
    try {
      hostname = new URL(String(request.origin)).hostname;
    } catch {
      return;
    }
    const targets = getServerConfig()?.requestIdTargets ?? DEFAULT_TARGETS;
    if (isTarget(hostname, targets)) {
      request.addHeader(HEADER, requestId);
    }
  });
}

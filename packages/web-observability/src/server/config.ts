import type { ServerOptions } from "../options.ts";

// 통합 진입점(.)과 /sentry 가 서로 다른 번들 청크로 로드돼도 같은 설정을 보도록 전역에 둔다
const CONFIG_KEY = Symbol.for(
  "@watcha-authentic/web-observability/server-config"
);

type ConfigHolder = { [CONFIG_KEY]?: ServerOptions };

export function setServerConfig(options: ServerOptions) {
  (globalThis as ConfigHolder)[CONFIG_KEY] = options;
}

export function getServerConfig(): ServerOptions | undefined {
  return (globalThis as ConfigHolder)[CONFIG_KEY];
}

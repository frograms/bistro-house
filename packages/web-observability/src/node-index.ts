/**
 * 통합 진입점(.)의 서버 구현. `browser-index.ts` 와 공개 API 가 같다. SSR 렌더링·loader 처럼 서버에서 도는 코드가 쓴다.
 */
export {
  getSessionId,
  init,
  logger,
} from "./script/module/facade/facade-node.ts";
export type {
  AttributeValue,
  BrowserOptions,
  Context,
  ErrorRecord,
  InitOptions,
  Logger,
  ServerOptions,
  SharedOptions,
} from "./script/type/observability-types.ts";

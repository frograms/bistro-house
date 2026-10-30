/**
 * 통합 진입점(.)의 브라우저 구현. `node-index.ts` 와 공개 API 가 같고, 번들러가 `browser`·`node` 조건으로 하나를 고른다.
 */
export {
  getSessionId,
  init,
  logger,
} from "./script/module/facade/facade-browser.ts";
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

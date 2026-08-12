import type { FetchDevtoolsCacheAdapter } from "../cache-adapter";
import type { DevtoolsTab } from "./panel";
import { Panel } from "./panel";
import { panelInteractionCss } from "./styles";

export type DevtoolsPanelProps = {
  cacheAdapter?: FetchDevtoolsCacheAdapter;
  extraTabs?: DevtoolsTab[];
  onRevalidate?: (key: string) => void;
};

const noop = () => {
  // embedded 모드에선 닫기 개념이 호스트 셸 소관
};

/** 버튼·포털·고정 위치 없는 임베더블 패널 — 남의 셸 안에 컴포넌트로 꽂는 용도 */
export const DevtoolsPanel = ({
  cacheAdapter,
  extraTabs,
  onRevalidate,
}: DevtoolsPanelProps) => {
  if (typeof window === "undefined") return null;
  const api = window.__API_DEVTOOLS__;
  if (api === undefined) return null;
  return (
    <>
      <style>{panelInteractionCss}</style>
      <Panel
        api={api}
        cacheAdapter={cacheAdapter}
        extraTabs={extraTabs}
        zIndex={0}
        embedded
        shown
        onClose={noop}
        onRevalidate={onRevalidate}
      />
    </>
  );
};
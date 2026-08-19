import type { HttpOverrideCacheAdapter } from "../cache-adapter";
import type { HttpOverridePreset } from "../core";
import type { HttpOverrideTab } from "./panel";
import { Panel } from "./panel";
import { panelInteractionCss } from "./styles";

export type HttpOverridePanelProps = {
  cacheAdapter?: HttpOverrideCacheAdapter;
  extraTabs?: HttpOverrideTab[];
  onRevalidate?: (key: string) => void;
  presets?: HttpOverridePreset[];
};

const noop = () => {
  // embedded 모드에선 닫기 개념이 호스트 셸 소관
};

/** 버튼·포털·고정 위치 없는 임베더블 패널 — 남의 셸 안에 컴포넌트로 꽂는 용도 */
export const HttpOverridePanel = ({
  cacheAdapter,
  extraTabs,
  onRevalidate,
  presets,
}: HttpOverridePanelProps) => {
  if (typeof window === "undefined") return null;
  const api = window.__HTTP_OVERRIDE__;
  if (api === undefined) return null;
  return (
    <>
      <style>{panelInteractionCss}</style>
      <Panel
        api={api}
        cacheAdapter={cacheAdapter}
        extraTabs={extraTabs}
        presets={presets}
        zIndex={0}
        embedded
        shown
        onClose={noop}
        onRevalidate={onRevalidate}
      />
    </>
  );
};
import { useHttpOverrideApi } from "./hooks";
import type { HttpOverridePanelOptions } from "./panel";
import { Panel } from "./panel";
import { panelInteractionCss } from "./styles";

export type HttpOverridePanelProps = HttpOverridePanelOptions;

const noop = () => {
  // embedded 모드에선 닫기 개념이 호스트 셸 소관
};

/** 버튼·포털·고정 위치 없는 임베더블 패널 — 남의 셸 안에 컴포넌트로 꽂는 용도 */
export const HttpOverridePanel = ({
  extraTabs,
  presets,
}: HttpOverridePanelProps) => {
  const api = useHttpOverrideApi();
  if (api === null) return null;
  return (
    <>
      <style>{panelInteractionCss}</style>
      <Panel
        api={api}
        extraTabs={extraTabs}
        presets={presets}
        zIndex={0}
        embedded
        shown
        onClose={noop}
      />
    </>
  );
};
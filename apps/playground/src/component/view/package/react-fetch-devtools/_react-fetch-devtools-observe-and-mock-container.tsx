import type { FetchDevtoolsApi } from "@packages/react-fetch-devtools/src/core";
import { installFetchDevtools } from "@packages/react-fetch-devtools/src/core";
import { DevtoolsLauncher } from "@packages/react-fetch-devtools/src/panel/devtools-launcher";
import { useRecords, useRules } from "@packages/react-fetch-devtools/src/panel/hooks";
import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactFetchDevtoolsObserveAndMockContainerCss as css } from "@playground/component/view/package/react-fetch-devtools/_react-fetch-devtools-observe-and-mock-container.css";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import { useCallback, useMemo, useState } from "react";

const DEMO_API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

const MOCK_500_PATTERN = "friend-ratings";
const DELAY_PATTERN = "contents";
const MOCK_500_BODY = JSON.stringify({
  message: "서버에 일시적인 문제가 발생했어요",
});

const NOTE_ITEMS = [
  "window.fetch를 덮어쓰지 않고, 앱 API 관문이 위임하는 구조입니다: (window.__API_DEVTOOLS__?.fetch ?? fetch)",
  "룰은 sessionStorage에 저장되어 새로고침 후에도 유지됩니다 (탭 격리).",
  "실서비스 응답 모양을 본뜬 로컬 데모 API를 호출합니다 (실제 서버 아님).",
];

const CODE_EXAMPLE = `// ① 부팅 최상단 (하이드레이션 전)
installFetchDevtools({ enabled: isStaging });

// ② 앱 API 관문 — 자발적 위임 한 줄
const response = await (window.__API_DEVTOOLS__?.fetch ?? fetch)(url, init);

// ③ 앱 루트 (React.lazy 권장)
<DevtoolsLauncher enabled={isStaging} />;`;

type CallResult = {
  body: string;
  durationMs: number;
  status: number;
  url: string;
};

const ObserveAndMockExample = ({ api }: { api: FetchDevtoolsApi }) => {
  const rules = useRules(api);
  const records = useRecords(api);
  const [pending, setPending] = useState(false);
  const [lastResult, setLastResult] = useState<CallResult | null>(null);

  const callApi = useCallback(async (url: string) => {
    setPending(true);
    const startedAt = Date.now();
    try {
      const response = await (window.__API_DEVTOOLS__?.fetch ?? fetch)(url);
      const body = await response.text();
      setLastResult({
        body,
        durationMs: Date.now() - startedAt,
        status: response.status,
        url,
      });
    } catch (error) {
      setLastResult({
        body: String(error),
        durationMs: Date.now() - startedAt,
        status: 0,
        url,
      });
    } finally {
      setPending(false);
    }
  }, []);

  const toggleRule = useCallback(
    (pattern: string, ruleBody: { body?: string; delayMs?: number; status?: number }) => {
      const existing = api.rules
        .getSnapshot()
        .find((rule) => rule.pattern === pattern);
      if (existing !== undefined) {
        api.rules.remove(existing.id);
        return;
      }
      api.rules.add({ pattern, ...ruleBody });
    },
    [api]
  );

  const handleRevalidate = useCallback(
    (key: string) => {
      void callApi(key);
    },
    [callApi]
  );

  const mock500On = rules.some((rule) => rule.pattern === MOCK_500_PATTERN);
  const delayOn = rules.some((rule) => rule.pattern === DELAY_PATTERN);

  const stateItems = useMemo(
    () => [
      {
        label: "마지막 status",
        value: lastResult === null ? "-" : lastResult.status,
      },
      {
        label: "durationMs",
        value: lastResult === null ? "-" : lastResult.durationMs,
      },
      { label: "활성 룰 수", value: rules.length },
      { label: "기록된 요청 수", value: records.length },
    ],
    [lastResult, records.length, rules.length]
  );

  return (
    <CommonContainer>
      <CommonNote items={NOTE_ITEMS} />

      <CommonExampleControlPanel>
        <div className={commonExampleControlsCss.controlGroup}>
          <label className={commonExampleControlsCss.checkboxField}>
            <input
              checked={mock500On}
              type="checkbox"
              onChange={() => {
                toggleRule(MOCK_500_PATTERN, {
                  body: MOCK_500_BODY,
                  status: 500,
                });
              }}
            />
            <span>friend-ratings에 500 목 응답 룰</span>
          </label>
          <label className={commonExampleControlsCss.checkboxField}>
            <input
              checked={delayOn}
              type="checkbox"
              onChange={() => {
                toggleRule(DELAY_PATTERN, { delayMs: 1500 });
              }}
            />
            <span>contents에 1.5초 지연 룰</span>
          </label>
        </div>
      </CommonExampleControlPanel>

      <CommonExampleStagePanel className={css.stage}>
        <p className={css.stageGuide}>
          호출 후 우하단 API 버튼으로 패널을 열어 기록·목 응답을 확인하세요.
        </p>

        <div className={css.callRow}>
          {["contents", "friend-ratings", "settings"].map((endpoint) => (
            <button
              key={endpoint}
              className={css.callButton}
              disabled={pending}
              type="button"
              onClick={() => {
                void callApi(`${DEMO_API_BASE}/${endpoint}`);
              }}>
              GET /api/{endpoint}
            </button>
          ))}
        </div>

        <div className={css.resultCard}>
          {lastResult === null ? (
            <p className={css.resultMeta}>
              {pending ? "요청 중…" : "아직 호출한 요청이 없습니다"}
            </p>
          ) : (
            <>
              <p className={css.resultMeta}>
                {pending
                  ? "요청 중…"
                  : `${lastResult.url} → ${lastResult.status === 0 ? "네트워크 오류" : lastResult.status} (${lastResult.durationMs}ms)`}
              </p>
              <pre
                className={
                  lastResult.status >= 400 || lastResult.status === 0
                    ? `${css.resultBody} ${css.resultError}`
                    : css.resultBody
                }
              >
                {lastResult.body}
              </pre>
            </>
          )}
        </div>
      </CommonExampleStagePanel>

      <CommonExampleStatePanel items={stateItems} />

      <DevtoolsLauncher enabled onRevalidate={handleRevalidate} />

      <CommonCodeBlock code={CODE_EXAMPLE} />
    </CommonContainer>
  );
};

export const ReactFetchDevtoolsObserveAndMockContainer = () => {
  const [api] = useState(() => installFetchDevtools({ enabled: true }));
  if (api === null) return null;
  return <ObserveAndMockExample api={api} />;
};

import type { HttpOverrideApi } from "@packages/react-http-override/src/core";
import { installHttpOverride } from "@packages/react-http-override/src/core";
import { useRecords, useRules } from "@packages/react-http-override/src/panel/hooks";
import { HttpOverrideLauncher } from "@packages/react-http-override/src/panel/http-override-launcher";
import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactHttpOverrideObserveAndMockContainerCss as css } from "@playground/component/view/package/react-http-override/_react-http-override-observe-and-mock-container.css";
import { DEMO_PRESETS } from "@playground/component/view/package/react-http-override/_shared/demo-presets";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

const DEMO_API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

const MOCK_500_PATTERN = "friend-ratings";
const DELAY_PATTERN = "contents";
const MOCK_500_BODY = JSON.stringify({
  message: "서버에 일시적인 문제가 발생했어요",
});

const NOTE_ITEMS = [
  "window.fetch를 덮어쓰지 않고, 앱 API 관문이 위임하는 구조입니다: (window.__HTTP_OVERRIDE__?.fetch ?? fetch)",
  "룰은 sessionStorage에 저장되어 새로고침 후에도 유지됩니다 (탭 격리).",
  "실서비스 응답 모양을 본뜬 로컬 데모 API를 호출합니다 (실제 서버 아님).",
  "앱이 정의한 프리셋은 요청 행을 펼치면 그 API에 맞는 것만 나타납니다 (이름도 바꿀 수 있어요).",
];

const CODE_EXAMPLE = `// ① 부팅 최상단 (하이드레이션 전)
installHttpOverride({ enabled: isStaging });

// ② 앱 API 관문 — 자발적 위임 한 줄
const response = await (window.__HTTP_OVERRIDE__?.fetch ?? fetch)(url, init);

// ③ 앱 루트 (React.lazy 권장)
<HttpOverrideLauncher enabled={isStaging} />;`;

type DemoEndpoint = "contents" | "friend-ratings";

type DemoContent = {
  code: string;
  genres: string[];
  nation: string;
  rating_avg: number;
  title: string;
  year: number;
};

type DemoFriendRating = {
  rating: number;
  user: { code: string; name: string };
};

type View =
  | { items: DemoContent[]; kind: "contents" }
  | { items: DemoFriendRating[]; kind: "friends"; total: number }
  | { kind: "error"; message: string; status: number }
  | { kind: "loading" };

const ObserveAndMockExample = ({ api }: { api: HttpOverrideApi }) => {
  const rules = useRules(api);
  const records = useRecords(api);
  const [view, setView] = useState<View | null>(null);
  const [lastMeta, setLastMeta] = useState<{
    durationMs: number;
    status: number;
  } | null>(null);

  const callApi = useCallback(async (endpoint: DemoEndpoint) => {
    setView({ kind: "loading" });
    const startedAt = Date.now();
    try {
      const response = await (window.__HTTP_OVERRIDE__?.fetch ?? fetch)(
        `${DEMO_API_BASE}/${endpoint}`
      );
      const text = await response.text();
      setLastMeta({
        durationMs: Date.now() - startedAt,
        status: response.status,
      });
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const parsed = JSON.parse(text) as { message?: string };
          if (parsed.message !== undefined) message = parsed.message;
        } catch {
          // body가 JSON이 아니면 기본 메시지
        }
        setView({ kind: "error", message, status: response.status });
        return;
      }
      const parsed = JSON.parse(text) as {
        contents?: DemoContent[];
        friend_ratings?: DemoFriendRating[];
        total_count?: number;
      };
      if (endpoint === "contents") {
        setView({ items: parsed.contents ?? [], kind: "contents" });
        return;
      }
      setView({
        items: parsed.friend_ratings ?? [],
        kind: "friends",
        total: parsed.total_count ?? 0,
      });
    } catch (error) {
      setLastMeta({ durationMs: Date.now() - startedAt, status: 0 });
      setView({ kind: "error", message: String(error), status: 0 });
    }
  }, []);

  const handleRevalidate = useCallback(
    (key: string) => {
      void callApi(key.includes("friend-ratings") ? "friend-ratings" : "contents");
    },
    [callApi]
  );

  const toggleRule = useCallback(
    (
      pattern: string,
      ruleBody: { body?: string; delayMs?: number; status?: number }
    ) => {
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

  const mock500On = rules.some((rule) => rule.pattern === MOCK_500_PATTERN);
  const delayOn = rules.some((rule) => rule.pattern === DELAY_PATTERN);
  const loading = view?.kind === "loading";

  const stateItems = useMemo(
    () => [
      {
        label: "마지막 status",
        value: lastMeta === null ? "-" : lastMeta.status,
      },
      {
        label: "durationMs",
        value: lastMeta === null ? "-" : lastMeta.durationMs,
      },
      { label: "활성 룰 수", value: rules.length },
      { label: "기록된 요청 수", value: records.length },
    ],
    [lastMeta, records.length, rules.length]
  );

  let viewContent: ReactNode;
  if (view === null) {
    viewContent = <p className={css.emptyText}>아직 호출한 요청이 없습니다</p>;
  } else if (view.kind === "loading") {
    viewContent = <p className={css.loadingText}>불러오는 중…</p>;
  } else if (view.kind === "error") {
    viewContent = (
      <>
        <p className={css.errorTitle}>요청 실패 ({view.status})</p>
        <p className={css.errorMessage}>{view.message}</p>
      </>
    );
  } else if (view.kind === "contents") {
    viewContent =
      view.items.length === 0 ? (
        <p className={css.emptyText}>볼 수 있는 콘텐츠가 없어요</p>
      ) : (
        <div className={css.contentGrid}>
          {view.items.map((content) => (
            <div key={content.code} className={css.contentCard}>
              <div className={css.posterBox}>{content.title.slice(0, 1)}</div>
              <p className={css.contentTitle}>{content.title}</p>
              <p className={css.contentMeta}>
                {content.year} · {content.nation} · ★{content.rating_avg}
              </p>
            </div>
          ))}
        </div>
      );
  } else {
    viewContent =
      view.items.length === 0 ? (
        <p className={css.emptyText}>친구 별점이 아직 없어요</p>
      ) : (
        <>
          {view.items.map((entry) => (
            <div key={entry.user.code} className={css.friendRow}>
              <span className={css.friendName}>{entry.user.name}</span>
              <span className={css.friendRating}>★ {entry.rating}</span>
            </div>
          ))}
          <p className={css.totalText}>총 {view.total}명</p>
        </>
      );
  }

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
          호출 후 우하단 API 버튼으로 패널을 열어 룰을 걸어보세요 — 아래 화면이
          목·지연·빈 상태에 그대로 반응합니다.
        </p>

        <div className={css.callRow}>
          {(["contents", "friend-ratings"] as const).map((endpoint) => (
            <button
              key={endpoint}
              className={css.callButton}
              disabled={loading}
              type="button"
              onClick={() => {
                void callApi(endpoint);
              }}
            >
              GET /api/{endpoint}
            </button>
          ))}
        </div>

        <div className={css.viewCard}>{viewContent}</div>
      </CommonExampleStagePanel>

      <CommonExampleStatePanel items={stateItems} />

      <HttpOverrideLauncher
        presets={DEMO_PRESETS}
        enabled
        onRevalidate={handleRevalidate}
      />

      <CommonCodeBlock code={CODE_EXAMPLE} />
    </CommonContainer>
  );
};

export const ReactHttpOverrideObserveAndMockContainer = () => {
  const [api] = useState(() => installHttpOverride({ enabled: true }));
  if (api === null) return null;
  return <ObserveAndMockExample api={api} />;
};

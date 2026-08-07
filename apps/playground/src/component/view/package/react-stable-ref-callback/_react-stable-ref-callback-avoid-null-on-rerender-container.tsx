import { useStableRefCallback } from "@packages/react-stable-ref-callback/src/component/hook/use-stable-ref-callback";
import { CommonCodeBlock } from "@playground/component/view/_common/common-code-block";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactStableRefCallbackAvoidNullOnRerenderContainerCss as css } from "@playground/component/view/package/react-stable-ref-callback/_react-stable-ref-callback-avoid-null-on-rerender-container.css";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

const MAX_LOG_COUNT = 8;

const CODE_EXAMPLE = `const stableRef = useStableRefCallback<HTMLDivElement>((node) => {
  // 리렌더만으로는 null이 다시 들어오지 않음
  console.log(node);
});

return <div ref={stableRef} />;`;

const formatRefCall = (node: HTMLDivElement | null) => {
  return node === null ? "null" : node.tagName.toLowerCase();
};

const pushLog = (logs: string[], node: HTMLDivElement | null) => {
  return [...logs, formatRefCall(node)].slice(-MAX_LOG_COUNT);
};

export const ReactStableRefCallbackAvoidNullOnRerenderContainer = () => {
  const [tick, setTick] = useState(0);
  const [inlineLogs, setInlineLogs] = useState<string[]>([]);
  const [stableLogs, setStableLogs] = useState<string[]>([]);

  const inlineLogsRef = useRef<string[]>([]);
  const stableLogsRef = useRef<string[]>([]);

  const flushLogsToState = useCallback(() => {
    setInlineLogs([...inlineLogsRef.current]);
    setStableLogs([...stableLogsRef.current]);
  }, []);

  // 마운트 직후 ref 호출 로그를 화면에 반영
  useLayoutEffect(() => {
    flushLogsToState();
  }, [flushLogsToState]);

  const stableRef = useStableRefCallback<HTMLDivElement>((node) => {
    stableLogsRef.current = pushLog(stableLogsRef.current, node);
  });

  const handleRerenderClick = useCallback(() => {
    // 직전 flush setState로 생긴 인라인 ref 추가 호출(팬텀)을 버리고 기준을 맞춘다
    inlineLogsRef.current = inlineLogs;
    stableLogsRef.current = stableLogs;

    setTick((value) => value + 1);

    queueMicrotask(() => {
      flushLogsToState();
    });
  }, [flushLogsToState, inlineLogs, stableLogs]);

  const handleClearLogsClick = useCallback(() => {
    inlineLogsRef.current = [];
    stableLogsRef.current = [];
    setInlineLogs([]);
    setStableLogs([]);
  }, []);

  const inlineNullCount = inlineLogs.filter((entry) => entry === "null").length;
  const stableNullCount = stableLogs.filter((entry) => entry === "null").length;

  return (
    <CommonContainer>
      <CommonNote
        items={[
          "인라인 callback ref는 렌더마다 함수 참조가 바뀌어, React가 이전 콜백에 null을 넣습니다.",
        ]}
      />

      <CommonExampleControlPanel>
        <div className={commonExampleControlsCss.controlGroup}>
          <button type="button" onClick={handleRerenderClick}>
            리렌더
          </button>
          <button type="button" onClick={handleClearLogsClick}>
            로그 초기화
          </button>
        </div>
      </CommonExampleControlPanel>

      <CommonExampleStagePanel className={css.stage}>
        <p className={css.stageGuide}>
          리렌더 후 inline만 null → element가 이어지고, stable은 추가 호출이
          없습니다.
        </p>

        <div className={css.targets}>
          <div className={css.card}>
            <p className={css.cardTitle}>inline ref</p>
            <div
              ref={(node) => {
                inlineLogsRef.current = pushLog(inlineLogsRef.current, node);
              }}
              className={css.target}>
              tick: {tick}
            </div>
            <ul className={css.logList}>
              {inlineLogs.length === 0 ? (
                <li className={css.logItem}>호출 없음</li>
              ) : (
                inlineLogs.map((entry, index) => (
                  <li key={`${entry}-${index}`} className={css.logItem}>
                    {index + 1}. {entry}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className={css.card}>
            <p className={css.cardTitle}>useStableRefCallback</p>
            <div ref={stableRef} className={css.target}>
              tick: {tick}
            </div>
            <ul className={css.logList}>
              {stableLogs.length === 0 ? (
                <li className={css.logItem}>호출 없음</li>
              ) : (
                stableLogs.map((entry, index) => (
                  <li key={`${entry}-${index}`} className={css.logItem}>
                    {index + 1}. {entry}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </CommonExampleStagePanel>

      <CommonExampleStatePanel
        items={[
          { label: "tick", value: tick },
          { label: "inline null 횟수", value: inlineNullCount },
          { label: "stable null 횟수", value: stableNullCount },
          {
            label: "stableRef.current",
            value: stableRef.current?.tagName.toLowerCase() ?? "null",
          },
        ]}
      />

      <CommonCodeBlock code={CODE_EXAMPLE} />
    </CommonContainer>
  );
};

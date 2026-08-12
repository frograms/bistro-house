import { useCallback, useMemo, useState } from "react";

import type { FetchDevtoolsApi, FetchDevtoolsRecord } from "../core";
import { useRules } from "./hooks";
import {
  actionLabelStyle,
  actionMessageInputStyle,
  actionNeutralButtonStyle,
  actionPrimaryButtonStyle,
  actionRowStyle,
  actionSectionStyle,
  actionStatusInputStyle,
  actionWarmButtonStyle,
  panelClassNames,
} from "./styles";

export type RowActionsProps = {
  api: FetchDevtoolsApi;
  onRevalidate?: (key: string) => void;
  record: FetchDevtoolsRecord;
};

/** URL을 리터럴 매칭 정규식으로 — 메타문자(? . + 등)가 있는 URL도 그대로 매칭되게 */
const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DELAY_MS = 3000;

export const RowActions = ({ api, onRevalidate, record }: RowActionsProps) => {
  const rules = useRules(api);
  const [status, setStatus] = useState("500");
  const [message, setMessage] = useState("");

  const matchedRules = useMemo(
    () =>
      rules.filter((rule) => {
        try {
          return new RegExp(rule.pattern).test(record.url);
        } catch {
          return false;
        }
      }),
    [record.url, rules]
  );

  const handleApplyError = useCallback(() => {
    const parsed = Number(status);
    if (!Number.isInteger(parsed)) return;
    api.rules.add({
      body: message === "" ? "" : JSON.stringify({ message }),
      pattern: escapeRegExp(record.url),
      status: parsed,
    });
  }, [api, message, record.url, status]);

  const handleDelay = useCallback(() => {
    api.rules.add({ delayMs: DELAY_MS, pattern: escapeRegExp(record.url) });
  }, [api, record.url]);

  const handleRevalidate = useCallback(() => {
    onRevalidate?.(record.url);
  }, [onRevalidate, record.url]);

  const handleRemoveRules = useCallback(() => {
    matchedRules.forEach((rule) => {
      api.rules.remove(rule.id);
    });
  }, [api, matchedRules]);

  return (
    <div style={actionSectionStyle}>
      <span style={actionLabelStyle}>에러 트리거 — status · 메시지</span>
      <div style={actionRowStyle}>
        <input
          aria-label="status"
          inputMode="numeric"
          style={actionStatusInputStyle}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        />
        <input
          aria-label="에러 메시지"
          placeholder="메시지 (선택)"
          style={actionMessageInputStyle}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </div>
      <div style={actionRowStyle}>
        <button
          className={panelClassNames.warmButton}
          style={actionWarmButtonStyle}
          type="button"
          onClick={handleApplyError}
        >
          적용 → 룰 생성
        </button>
        <button
          className={panelClassNames.actionButton}
          style={actionNeutralButtonStyle}
          type="button"
          onClick={handleDelay}
        >
          지연 {DELAY_MS / 1000}초
        </button>
        {onRevalidate !== undefined && (
          <button
            className={panelClassNames.actionButton}
            style={actionPrimaryButtonStyle}
            type="button"
            onClick={handleRevalidate}
          >
            재요청
          </button>
        )}
        {matchedRules.length > 0 && (
          <button
            className={panelClassNames.actionButton}
            style={actionNeutralButtonStyle}
            type="button"
            onClick={handleRemoveRules}
          >
            룰 해제 ({matchedRules.length})
          </button>
        )}
      </div>
    </div>
  );
};

import { useCallback, useMemo, useState } from "react";

import type { FetchDevtoolsApi, FetchDevtoolsRecord } from "../core";
import { useRules } from "./hooks";
import {
  actionBodyHintBrokenStyle,
  actionBodyHintJsonStyle,
  actionBodyInputStyle,
  actionLabelStyle,
  actionNeutralButtonStyle,
  actionPrimaryButtonStyle,
  actionRowStyle,
  actionSectionStyle,
  actionStatusInputStyle,
  actionWarmButtonStyle,
  palette,
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

type BodyKind = "broken" | "json" | "text";

const bodyKindOf = (input: string): BodyKind => {
  const trimmed = input.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return "text";
  try {
    JSON.parse(trimmed);
    return "json";
  } catch {
    return "broken";
  }
};

const bodyToInput = (body: string | undefined): string => {
  if (body === undefined || body === "") return "";
  try {
    const parsed: unknown = JSON.parse(body);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      const record = parsed as Record<string, unknown>;
      const keys = Object.keys(record);
      if (keys.length === 1 && typeof record.message === "string") {
        return record.message;
      }
    }
  } catch {
    // JSON 아니면 원문 표시
  }
  return body;
};

const buildErrorBody = (input: string): string => {
  if (input.trim() === "") return "";
  return bodyKindOf(input) === "json"
    ? input.trim()
    : JSON.stringify({ message: input });
};

export const RowActions = ({ api, onRevalidate, record }: RowActionsProps) => {
  const rules = useRules(api);
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

  const firstMatched = matchedRules[0];
  const [status, setStatus] = useState(() =>
    firstMatched?.status !== undefined ? String(firstMatched.status) : "500"
  );
  const [message, setMessage] = useState(() => bodyToInput(firstMatched?.body));
  const bodyKind = message.trim() === "" ? "text" : bodyKindOf(message);

  const replaceMatchedRules = useCallback(
    (input: { body?: string; delayMs?: number; status?: number }) => {
      matchedRules.forEach((rule) => {
        api.rules.remove(rule.id);
      });
      api.rules.add({ pattern: escapeRegExp(record.url), ...input });
    },
    [api, matchedRules, record.url]
  );

  const handleApplyError = useCallback(() => {
    const parsed = Number(status);
    if (!Number.isInteger(parsed)) return;
    replaceMatchedRules({
      body: buildErrorBody(message),
      status: parsed,
    });
  }, [message, replaceMatchedRules, status]);

  const handleDelay = useCallback(() => {
    replaceMatchedRules({ delayMs: DELAY_MS });
  }, [replaceMatchedRules]);

  const handleRevalidate = useCallback(() => {
    onRevalidate?.(record.url);
  }, [onRevalidate, record.url]);

  const bodyInputStyle = useMemo(
    () => ({
      ...actionBodyInputStyle,
      ...(bodyKind === "json" ? { borderColor: palette.teal } : null),
      ...(bodyKind === "broken" ? { borderColor: palette.orange } : null),
    }),
    [bodyKind]
  );

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
        {bodyKind === "json" && (
          <span style={actionBodyHintJsonStyle}>JSON body로 전송</span>
        )}
        {bodyKind === "broken" && (
          <span style={actionBodyHintBrokenStyle}>
            JSON 문법 오류 — 평문으로 전송
          </span>
        )}
      </div>
      <textarea
        aria-label="에러 메시지"
        placeholder="메시지 또는 JSON body"
        rows={2}
        style={bodyInputStyle}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div style={actionRowStyle}>
        <button
          className={panelClassNames.warmButton}
          style={actionWarmButtonStyle}
          type="button"
          onClick={handleApplyError}>
          적용 → 룰 생성
        </button>
        <button
          className={panelClassNames.actionButton}
          style={actionNeutralButtonStyle}
          type="button"
          onClick={handleDelay}>
          지연 {DELAY_MS / 1000}초
        </button>
        {onRevalidate !== undefined && (
          <button
            className={panelClassNames.actionButton}
            style={actionPrimaryButtonStyle}
            type="button"
            onClick={handleRevalidate}>
            재요청
          </button>
        )}
        {matchedRules.length > 0 && (
          <button
            className={panelClassNames.actionButton}
            style={actionNeutralButtonStyle}
            type="button"
            onClick={handleRemoveRules}>
            룰 해제 ({matchedRules.length})
          </button>
        )}
      </div>
    </div>
  );
};

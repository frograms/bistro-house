import { useCallback, useMemo, useState } from "react";

import type { FetchDevtoolsApi, FetchDevtoolsRecord } from "../core";
import { useRules } from "./hooks";
import {
  actionBodyHintBrokenStyle,
  actionBodyHintJsonStyle,
  actionBodyInputStyle,
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
export const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

type TriggerMode = "error" | "loading" | null;

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
  const isErrorActive = firstMatched?.status !== undefined;
  const isLoadingActive =
    firstMatched?.status === undefined && firstMatched?.delayMs !== undefined;

  const [mode, setMode] = useState<TriggerMode>(() => {
    if (isErrorActive) return "error";
    if (isLoadingActive) return "loading";
    return null;
  });
  const [status, setStatus] = useState(() =>
    firstMatched?.status !== undefined ? String(firstMatched.status) : "500"
  );
  const [message, setMessage] = useState(() => bodyToInput(firstMatched?.body));
  const [delayMs, setDelayMs] = useState(() =>
    firstMatched?.delayMs !== undefined ? String(firstMatched.delayMs) : "3000"
  );
  const bodyKind = message.trim() === "" ? "text" : bodyKindOf(message);

  const replaceMatchedRules = useCallback(
    (input: { body?: string; delayMs?: number; status?: number }) => {
      matchedRules.forEach((rule) => {
        if (rule.patch !== undefined) return;
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
    const parsed = Number(delayMs);
    if (!(parsed > 0)) return;
    replaceMatchedRules({ delayMs: Math.round(parsed) });
  }, [delayMs, replaceMatchedRules]);

  const handleRevalidate = useCallback(() => {
    onRevalidate?.(record.url);
  }, [onRevalidate, record.url]);

  const handleRemoveRules = useCallback(() => {
    matchedRules.forEach((rule) => {
      api.rules.remove(rule.id);
    });
  }, [api, matchedRules]);

  const bodyInputStyle = useMemo(
    () => ({
      ...actionBodyInputStyle,
      ...(bodyKind === "json" ? { borderColor: palette.teal } : null),
      ...(bodyKind === "broken" ? { borderColor: palette.orange } : null),
    }),
    [bodyKind]
  );

  return (
    <div style={actionSectionStyle}>
      <div style={actionRowStyle}>
        {onRevalidate !== undefined && (
          <button
            className={panelClassNames.actionButton}
            style={actionPrimaryButtonStyle}
            type="button"
            onClick={handleRevalidate}>
            재요청
          </button>
        )}
        <button
          className={panelClassNames.warmButton}
          style={
            mode === "error" ? actionWarmButtonStyle : actionNeutralButtonStyle
          }
          type="button"
          onClick={() => setMode((cur) => (cur === "error" ? null : "error"))}>
          Error 트리거{isErrorActive && " 중"}
        </button>
        <button
          className={panelClassNames.actionButton}
          style={
            mode === "loading"
              ? actionWarmButtonStyle
              : actionNeutralButtonStyle
          }
          type="button"
          onClick={() =>
            setMode((cur) => (cur === "loading" ? null : "loading"))
          }>
          Loading 트리거{isLoadingActive && " 중"}
        </button>
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
      {mode === "error" && (
        <>
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
          </div>
        </>
      )}
      {mode === "loading" && (
        <div style={actionRowStyle}>
          <input
            aria-label="지연 ms"
            inputMode="numeric"
            style={actionStatusInputStyle}
            value={delayMs}
            onChange={(event) => setDelayMs(event.target.value)}
          />
          <button
            className={panelClassNames.actionButton}
            style={actionNeutralButtonStyle}
            type="button"
            onClick={handleDelay}>
            지연 적용
          </button>
        </div>
      )}
    </div>
  );
};

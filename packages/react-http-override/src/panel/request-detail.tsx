import { useCallback, useState } from "react";

import type {
  FetchDevtoolsApi,
  FetchDevtoolsPreset,
  FetchDevtoolsRecord,
} from "../core";
import { useRules } from "./hooks";
import { JsonViewer } from "./json-viewer";
import { PresetSection } from "./preset-section";
import { exactUrlPattern, RowActions } from "./row-actions";
import {
  actionBodyHintBrokenStyle,
  actionBodyHintJsonStyle,
  actionBodyInputStyle,
  actionRowStyle,
  actionWarmButtonStyle,
  chipErrorStyle,
  chipOkStyle,
  detailInfoRowStyle,
  detailInfoValueStyle,
  detailSectionBodyStyle,
  detailSectionHeaderStyle,
  detailTopStyle,
  detailUrlStyle,
  ghostButtonStyle,
  mockBadgeStyle,
  panelClassNames,
  rulePatternStyle,
} from "./styles";

export type RequestDetailProps = {
  api: FetchDevtoolsApi;
  onRevalidate?: (key: string) => void;
  presets?: FetchDevtoolsPreset[];
  record: FetchDevtoolsRecord;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatTime = (epochMs: number): string => {
  const date = new Date(epochMs);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
};

type PatchEntry = { path: string; remove?: boolean; value?: unknown };

/** "undefined" 입력은 키 제거, JSON이면 그 타입 그대로, 평문은 문자열 */
const parseEditValue = (input: string): Omit<PatchEntry, "path"> => {
  const trimmed = input.trim();
  if (trimmed === "undefined") return { remove: true };
  if (trimmed === "") return { value: "" };
  try {
    return { value: JSON.parse(trimmed) };
  } catch {
    return { value: input };
  }
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={detailInfoRowStyle}>
    <span>{label}</span>
    <span style={detailInfoValueStyle}>{value}</span>
  </div>
);

export const RequestDetail = ({
  api,
  onRevalidate,
  presets,
  record,
}: RequestDetailProps) => {
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const rules = useRules(api);

  const mockActive = rules.some((rule) => {
    if (rule.status === undefined) return false;
    try {
      return new RegExp(rule.pattern).test(record.url);
    } catch {
      return false;
    }
  });

  // 같은 URL의 patch 전용 룰에 누적 (없으면 생성)
  const addPatch = useCallback(
    (path: string, entry: Omit<PatchEntry, "path">) => {
      const pattern = exactUrlPattern(record.url);
      const existing = api.rules
        .getSnapshot()
        .find(
          (rule) =>
            rule.pattern === pattern &&
            rule.patch !== undefined &&
            rule.status === undefined
        );
      if (existing?.patch !== undefined) {
        api.rules.update(existing.id, {
          patch: [
            ...existing.patch.filter((patch) => patch.path !== path),
            { path, ...entry },
          ],
        });
        return;
      }
      api.rules.add({ patch: [{ path, ...entry }], pattern });
    },
    [api, record.url]
  );

  const handleEmptyPath = useCallback(
    (path: string, suggested: unknown) => {
      addPatch(path, { value: suggested });
      onRevalidate?.(record.url);
    },
    [addPatch, onRevalidate, record.url]
  );

  const handleEditPath = useCallback((path: string, current: unknown) => {
    setEditingPath(path);
    setEditValue(JSON.stringify(current) ?? "");
  }, []);

  const handleApplyEdit = useCallback(() => {
    if (editingPath === null) return;
    addPatch(editingPath, parseEditValue(editValue));
    setEditingPath(null);
    onRevalidate?.(record.url);
  }, [addPatch, editingPath, editValue, onRevalidate, record.url]);

  return (
    <>
      <div style={detailSectionHeaderStyle}>요청 정보</div>
      <div style={detailSectionBodyStyle}>
        <div style={detailTopStyle}>
          <span style={detailUrlStyle}>
            {record.method} {record.url}
          </span>
          {record.status === 0 && <span style={chipErrorStyle}>ERR</span>}
          {record.status >= 400 && (
            <span style={chipErrorStyle}>{record.status}</span>
          )}
          {record.status > 0 && record.status < 400 && (
            <span style={chipOkStyle}>{record.status}</span>
          )}
          {record.mocked && <span style={mockBadgeStyle}>MOCK</span>}
          {record.patched === true && <span style={mockBadgeStyle}>PATCH</span>}
        </div>
        <InfoRow label="durationMs" value={`${record.durationMs}ms`} />
        <InfoRow label="시각" value={formatTime(record.startedAt)} />
        {record.ruleId !== undefined && (
          <InfoRow label="rule" value={record.ruleId} />
        )}
        {record.error !== undefined && (
          <InfoRow label="error" value={record.error} />
        )}
      </div>

      <div style={detailSectionHeaderStyle}>Actions</div>
      <div style={detailSectionBodyStyle}>
        <RowActions api={api} record={record} onRevalidate={onRevalidate} />
      </div>

      {presets !== undefined && (
        <PresetSection
          api={api}
          presets={presets}
          record={record}
          onRevalidate={onRevalidate}
        />
      )}

      <div style={detailSectionHeaderStyle}>Data Explorer</div>
      <div style={detailSectionBodyStyle}>
        {mockActive && (
          <div style={actionRowStyle}>
            <span style={actionBodyHintBrokenStyle}>
              Error 목 응답 중 — 패치는 Error 룰 해제 후 적용돼요
            </span>
          </div>
        )}
        {editingPath !== null && (
          <>
            <div style={actionRowStyle}>
              <span style={rulePatternStyle}>{editingPath} =</span>
              {editValue.trim() === "undefined" && (
                <span style={actionBodyHintBrokenStyle}>
                  예약어 — 필드 자체를 제거
                </span>
              )}
              {editValue.trim() === "null" && (
                <span style={actionBodyHintJsonStyle}>예약어 — null 값</span>
              )}
            </div>
            <textarea
              aria-label="패치 값"
              rows={2}
              style={actionBodyInputStyle}
              value={editValue}
              onChange={(event) => setEditValue(event.target.value)}
            />
            <div style={actionRowStyle}>
              <button
                className={panelClassNames.warmButton}
                style={actionWarmButtonStyle}
                type="button"
                onClick={handleApplyEdit}>
                {onRevalidate !== undefined
                  ? "바꾸고 재요청"
                  : "이 값으로 바꾸기"}
              </button>
              <button
                className={panelClassNames.actionButton}
                style={ghostButtonStyle}
                type="button"
                onClick={() => setEditingPath(null)}>
                취소
              </button>
            </div>
          </>
        )}
        <JsonViewer
          record={record}
          onEditPath={handleEditPath}
          onEmptyPath={handleEmptyPath}
        />
      </div>
    </>
  );
};

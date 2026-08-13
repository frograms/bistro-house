import type { FetchDevtoolsApi, FetchDevtoolsRecord } from "../core";
import { JsonViewer } from "./json-viewer";
import { RowActions } from "./row-actions";
import {
  chipErrorStyle,
  chipOkStyle,
  detailInfoRowStyle,
  detailInfoValueStyle,
  detailSectionBodyStyle,
  detailSectionHeaderStyle,
  detailTopStyle,
  detailUrlStyle,
  mockBadgeStyle,
} from "./styles";

export type RequestDetailProps = {
  api: FetchDevtoolsApi;
  onRevalidate?: (key: string) => void;
  record: FetchDevtoolsRecord;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatTime = (epochMs: number): string => {
  const date = new Date(epochMs);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={detailInfoRowStyle}>
    <span>{label}</span>
    <span style={detailInfoValueStyle}>{value}</span>
  </div>
);

/** RQ devtools식 섹션 구성: 요청 정보 → Actions → Data Explorer */
export const RequestDetail = ({ api, onRevalidate, record }: RequestDetailProps) => (
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

    <div style={detailSectionHeaderStyle}>Data Explorer</div>
    <div style={detailSectionBodyStyle}>
      <JsonViewer record={record} />
    </div>
  </>
);

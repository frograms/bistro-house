import { useEffect, useState } from "react";

import type { HttpOverrideRecord } from "../core";
import { SourceIcon } from "./source-icon";
import {
  chipErrorStyle,
  chipOkStyle,
  chipPendingStyle,
  mockBadgeStyle,
  panelClassNames,
  pendingSpinnerStyle,
  rowButtonSelectedStyle,
  rowButtonStyle,
  rowCountErrorStyle,
  rowCountOkStyle,
  rowCountPendingStyle,
  rowListStyle,
  rowMethodStyle,
  rowRuleChipStyle,
  rowRuledStripeStyle,
  rowTimeStyle,
  rowUrlStyle,
  tableEmptyStyle,
} from "./styles";

/** 같은 method+URL의 기록 묶음 — 행 하나로 표시하고 최신 기록을 대표로 씀 */
export type RequestGroup = {
  count: number;
  key: string;
  latest: HttpOverrideRecord;
};

export type RequestTableProps = {
  groups: RequestGroup[];
  onSelectGroup: (key: string) => void;

  ruledKeys: ReadonlySet<string>;
  selectedKey: string | null;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatTime = (epochMs: number): string => {
  const date = new Date(epochMs);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
};

export const isErrorRecord = (record: HttpOverrideRecord): boolean =>
  record.state === "error" || (record.status !== null && record.status >= 400);

const ELAPSED_TICK_MS = 100;

const PendingChip = ({ startedAt }: { startedAt: number }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, ELAPSED_TICK_MS);
    return () => {
      window.clearInterval(id);
    };
  }, []);

  const elapsedSeconds = Math.max(0, now - startedAt) / 1000;
  return (
    <span aria-label="응답 대기 중" style={chipPendingStyle}>
      <span
        aria-hidden="true"
        className={panelClassNames.spinner}
        style={pendingSpinnerStyle}
      />
      {`${elapsedSeconds.toFixed(1)}s`}
    </span>
  );
};

const countStyleOf = (record: HttpOverrideRecord) => {
  if (record.state === "pending") return rowCountPendingStyle;
  return isErrorRecord(record) ? rowCountErrorStyle : rowCountOkStyle;
};

export const StatusChip = ({ record }: { record: HttpOverrideRecord }) => {
  if (record.state === "pending") {
    return <PendingChip startedAt={record.startedAt} />;
  }
  if (record.status === null) return null;
  if (record.state === "error") {
    return <span style={chipErrorStyle}>ERR</span>;
  }
  return (
    <span style={record.status >= 400 ? chipErrorStyle : chipOkStyle}>
      {record.status}
    </span>
  );
};

export const RequestTable = ({
  groups,
  onSelectGroup,
  ruledKeys,
  selectedKey,
}: RequestTableProps) => {
  if (groups.length === 0) {
    return <p style={tableEmptyStyle}>아직 기록된 요청이 없습니다</p>;
  }

  return (
    <ul style={rowListStyle}>
      {groups.map((group) => (
        <li key={group.key}>
          <button
            className={panelClassNames.row}
            style={{
              ...(group.key === selectedKey
                ? rowButtonSelectedStyle
                : rowButtonStyle),
              ...(ruledKeys.has(group.key) ? rowRuledStripeStyle : null),
            }}
            title={ruledKeys.has(group.key) ? "활성 룰 적용 중" : undefined}
            type="button"
            onClick={() => onSelectGroup(group.key)}>
            <span style={countStyleOf(group.latest)}>
              {group.count}
            </span>
            <span style={rowTimeStyle}>
              {formatTime(group.latest.startedAt)}
            </span>
            <SourceIcon record={group.latest} />
            <span style={rowMethodStyle}>{group.latest.method}</span>
            <span style={rowUrlStyle}>{group.latest.url}</span>
            {ruledKeys.has(group.key) && (
              <span style={rowRuleChipStyle}>룰</span>
            )}
            <StatusChip record={group.latest} />
            {group.latest.mocked && <span style={mockBadgeStyle}>MOCK</span>}
            {group.latest.patched === true && (
              <span style={mockBadgeStyle}>PATCH</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

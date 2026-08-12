import type { FetchDevtoolsRecord } from "../core";
import {
  chipErrorStyle,
  chipOkStyle,
  mockBadgeStyle,
  panelClassNames,
  rowButtonSelectedStyle,
  rowButtonStyle,
  rowCountErrorStyle,
  rowCountOkStyle,
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
  latest: FetchDevtoolsRecord;
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

const isErrorStatus = (record: FetchDevtoolsRecord): boolean =>
  record.status === 0 || record.status >= 400;

const StatusChip = ({ record }: { record: FetchDevtoolsRecord }) => {
  if (record.status === 0) {
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
            <span
              style={
                isErrorStatus(group.latest)
                  ? rowCountErrorStyle
                  : rowCountOkStyle
              }>
              {group.count}
            </span>
            <span style={rowTimeStyle}>
              {formatTime(group.latest.startedAt)}
            </span>
            <span style={rowMethodStyle}>{group.latest.method}</span>
            <span style={rowUrlStyle}>{group.latest.url}</span>
            {ruledKeys.has(group.key) && (
              <span style={rowRuleChipStyle}>룰</span>
            )}
            <StatusChip record={group.latest} />
            {group.latest.mocked && <span style={mockBadgeStyle}>MOCK</span>}
          </button>
        </li>
      ))}
    </ul>
  );
};

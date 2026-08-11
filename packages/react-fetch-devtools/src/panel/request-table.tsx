import type { FetchDevtoolsRecord } from "../core";
import {
  chipErrorStyle,
  chipOkStyle,
  mockBadgeStyle,
  panelClassNames,
  rowButtonSelectedStyle,
  rowButtonStyle,
  rowListStyle,
  rowMethodStyle,
  rowTimeStyle,
  rowUrlStyle,
  tableEmptyStyle,
} from "./styles";

export type RequestTableProps = {
  onSelectRecord: (seq: number) => void;
  records: FetchDevtoolsRecord[];
  selectedSeq: number | null;
};

const pad2 = (value: number): string => String(value).padStart(2, "0");

const formatTime = (epochMs: number): string => {
  const date = new Date(epochMs);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
};

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
  onSelectRecord,
  records,
  selectedSeq,
}: RequestTableProps) => {
  if (records.length === 0) {
    return <p style={tableEmptyStyle}>아직 기록된 요청이 없습니다</p>;
  }

  return (
    <ul style={rowListStyle}>
      {records.map((record) => (
        <li key={record.seq}>
          <button
            className={panelClassNames.row}
            style={
              record.seq === selectedSeq ? rowButtonSelectedStyle : rowButtonStyle
            }
            type="button"
            onClick={() => onSelectRecord(record.seq)}
          >
            <span style={rowTimeStyle}>{formatTime(record.startedAt)}</span>
            <span style={rowMethodStyle}>{record.method}</span>
            <span style={rowUrlStyle}>{record.url}</span>
            <StatusChip record={record} />
            {record.mocked && <span style={mockBadgeStyle}>MOCK</span>}
          </button>
        </li>
      ))}
    </ul>
  );
};

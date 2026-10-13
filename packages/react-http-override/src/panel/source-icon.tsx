import type { HttpOverrideRecord } from "../core";
import { sourceIconStyle } from "./styles";

export const sourceLabelOf = (record: HttpOverrideRecord): string => {
  if (record.source === "client") return "클라이언트 요청";
  return record.method === "SSR" ? "서버 (SSR 초기 데이터)" : "서버 (loader 요청)";
};

export const SourceIcon = ({ record }: { record: HttpOverrideRecord }) => (
  <svg
    aria-label={sourceLabelOf(record)}
    fill="none"
    height={12}
    role="img"
    stroke="currentColor"
    strokeLinecap="round"
    strokeWidth={1.4}
    style={sourceIconStyle}
    viewBox="0 0 12 12"
    width={12}>
    <title>{sourceLabelOf(record)}</title>
    {record.source === "server" ? (
      <>
        <rect height={4} rx={1} width={10} x={1} y={1} />
        <rect height={4} rx={1} width={10} x={1} y={7} />
        <path d="M3.5 3h.01M3.5 9h.01" />
      </>
    ) : (
      <>
        <rect height={9} rx={1.2} width={10} x={1} y={1.5} />
        <path d="M1 4.5h10" />
      </>
    )}
  </svg>
);

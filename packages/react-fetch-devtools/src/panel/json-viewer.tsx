import type { ReactNode } from "react";
import { useMemo } from "react";

import type { FetchDevtoolsRecord } from "../core";
import { JsonTree } from "./json-tree";
import { detailBodyStyle, detailEmptyBodyStyle, detailMetaStyle } from "./styles";

type ParsedBody = { ok: false } | { ok: true; value: unknown };

const parseBody = (body: string): ParsedBody => {
  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false };
  }
};

export const JsonViewer = ({ record }: { record: FetchDevtoolsRecord }) => {
  const parsed = useMemo(
    () =>
      record.responseBody === null
        ? ({ ok: false } as const)
        : parseBody(record.responseBody),
    [record.responseBody]
  );

  let bodyView: ReactNode;
  if (record.responseBody === null) {
    bodyView = (
      <p style={detailEmptyBodyStyle}>본문이 없거나 아직 캡처되지 않았습니다</p>
    );
  } else if (parsed.ok) {
    bodyView = <JsonTree key={record.responseBody} value={parsed.value} />;
  } else {
    bodyView = <pre style={detailBodyStyle}>{record.responseBody}</pre>;
  }

  return (
    <>
      <p style={detailMetaStyle}>
        {record.method} {record.url}
        <br />
        status {record.status === 0 ? "없음 (네트워크 오류)" : record.status} ·{" "}
        {record.durationMs}ms
        {record.mocked && " · mocked"}
        {record.ruleId !== undefined && (
          <>
            <br />
            rule: {record.ruleId}
          </>
        )}
        {record.error !== undefined && (
          <>
            <br />
            error: {record.error}
          </>
        )}
      </p>
      {bodyView}
    </>
  );
};

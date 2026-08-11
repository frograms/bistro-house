import { useMemo } from "react";

import type { FetchDevtoolsRecord } from "../core";
import { detailBodyStyle, detailEmptyBodyStyle, detailMetaStyle } from "./styles";

const formatBody = (body: string): string => {
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

export const JsonViewer = ({ record }: { record: FetchDevtoolsRecord }) => {
  const formattedBody = useMemo(
    () =>
      record.responseBody === null ? null : formatBody(record.responseBody),
    [record.responseBody]
  );

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
      {formattedBody === null ? (
        <p style={detailEmptyBodyStyle}>본문이 없거나 아직 캡처되지 않았습니다</p>
      ) : (
        <pre style={detailBodyStyle}>{formattedBody}</pre>
      )}
    </>
  );
};

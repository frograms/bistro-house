import { useMemo } from "react";

import type { FetchDevtoolsRecord } from "../core";
import { JsonTree } from "./json-tree";
import { detailBodyStyle, detailEmptyBodyStyle } from "./styles";

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

  if (record.responseBody === null) {
    return (
      <p style={detailEmptyBodyStyle}>본문이 없거나 아직 캡처되지 않았습니다</p>
    );
  }
  if (parsed.ok) {
    return <JsonTree key={record.responseBody} value={parsed.value} />;
  }
  return <pre style={detailBodyStyle}>{record.responseBody}</pre>;
};

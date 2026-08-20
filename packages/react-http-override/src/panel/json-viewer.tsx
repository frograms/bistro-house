import { useMemo } from "react";

import type { HttpOverrideRecord } from "../core";
import { isTruncatedBody } from "../core";
import { JsonTree } from "./json-tree";
import {
  actionBodyHintBrokenStyle,
  detailBodyStyle,
  detailEmptyBodyStyle,
} from "./styles";

type ParsedBody = { ok: false } | { ok: true; value: unknown };

const parseBody = (body: string): ParsedBody => {
  try {
    return { ok: true, value: JSON.parse(body) };
  } catch {
    return { ok: false };
  }
};

export const JsonViewer = ({
  onEditPath,
  onEmptyPath,
  record,
}: {
  onEditPath?: (path: string, current: unknown) => void;
  onEmptyPath?: (path: string, suggested: unknown) => void;
  record: HttpOverrideRecord;
}) => {
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
    return (
      <JsonTree
        key={record.responseBody}
        value={parsed.value}
        onEditPath={onEditPath}
        onEmptyPath={onEmptyPath}
      />
    );
  }
  return (
    <>
      {isTruncatedBody(record.responseBody) && (
        <span style={actionBodyHintBrokenStyle}>
          응답이 maxBodyBytes 한도를 넘어 잘려 트리로 볼 수 없습니다 —
          installHttpOverride의 maxBodyBytes 옵션으로 한도를 늘릴 수 있어요
        </span>
      )}
      <pre style={detailBodyStyle}>{record.responseBody}</pre>
    </>
  );
};

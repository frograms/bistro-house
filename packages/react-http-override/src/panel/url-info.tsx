import { useCallback, useEffect, useRef, useState } from "react";

import {
  detailInfoRowStyle,
  detailInfoValueStyle,
  formTableStyle,
  queryBlockStyle,
  queryKeyStyle,
  queryRowStyle,
  queryValueStyle,
  treeCopyButtonStyle,
} from "./styles";

export type ParsedRecordUrl = {
  origin: string | null;
  params: [string, string][];
  pathname: string;
};

const RELATIVE_BASE = "http://relative.invalid";

/** 절대 URL은 origin·경로·쿼리로, 상대 URL은 origin 없이 나눈다 */
export const parseRecordUrl = (url: string): ParsedRecordUrl => {
  try {
    const parsed = new URL(url, RELATIVE_BASE);
    const relative = parsed.origin === RELATIVE_BASE;
    return {
      origin: relative ? null : parsed.origin,
      params: [...parsed.searchParams.entries()],
      pathname: parsed.pathname,
    };
  } catch {
    return { origin: null, params: [], pathname: url };
  }
};

const COPY_FEEDBACK_MS = 1200;

export const CopyUrlButton = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    []
  );

  const handleCopy = useCallback(() => {
    try {
      void navigator.clipboard
        ?.writeText(url)
        .then(() => {
          setCopied(true);
          if (timerRef.current !== null) window.clearTimeout(timerRef.current);
          timerRef.current = window.setTimeout(() => {
            setCopied(false);
          }, COPY_FEEDBACK_MS);
        })
        .catch(() => {
          // 클립보드 쓰기 실패 — 성공 피드백을 띄우지 않는다
        });
    } catch {
      // 클립보드 미지원 환경 무시
    }
  }, [url]);

  return (
    <button
      aria-label="전체 URL 복사"
      style={treeCopyButtonStyle}
      type="button"
      onClick={handleCopy}>
      {copied ? "✓ 복사됨" : "URL 복사"}
    </button>
  );
};

export const QueryParamsTable = ({ params }: { params: [string, string][] }) => (
  <div style={queryBlockStyle}>
    <div style={detailInfoRowStyle}>
      <span>query</span>
    </div>
    <table aria-label="쿼리 파라미터" style={formTableStyle}>
      <tbody>
        {params.map(([key, value], index) => (
          <tr key={`${key}-${index}`} style={queryRowStyle}>
            <td style={queryKeyStyle}>{key}</td>
            <td style={queryValueStyle}>{value === "" ? "(empty)" : value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const UrlInfoRows = ({ url }: { url: string }) => {
  const { origin, params } = parseRecordUrl(url);
  return (
    <>
      {origin !== null && (
        <div style={detailInfoRowStyle}>
          <span>origin</span>
          <span style={detailInfoValueStyle}>{origin}</span>
        </div>
      )}
      {params.length > 0 && <QueryParamsTable params={params} />}
    </>
  );
};

import {
  formLineHeaderStyle,
  formTableStyle,
  queryKeyStyle,
  queryRowStyle,
  queryValueStyle,
} from "./styles";

export type FormLine = [string, string][];

const FORM_LINE = /^[^=&\s]+=[^&\s]*(&[^=&\s]+=[^&\s]*)*$/;

/** `a=1&b=2` 줄이 줄바꿈으로 이어진 본문(GA collect 등)을 줄별 키·값으로 푼다. 형식이 아니면 null */
export const parseFormBody = (body: string): FormLine[] | null => {
  const lines = body.split(/\r?\n/).filter((line) => line !== "");
  if (lines.length === 0 || !lines.every((line) => FORM_LINE.test(line))) {
    return null;
  }
  return lines.map((line) => [...new URLSearchParams(line).entries()]);
};

const lineTitle = (line: FormLine, index: number): string => {
  const [key, value] = line[0] ?? ["", ""];
  return `#${index + 1}  ${key}=${value}`;
};

export const FormBodyView = ({ lines }: { lines: FormLine[] }) => (
  <>
    {lines.map((line, index) => (
      <div key={index}>
        {lines.length > 1 && (
          <div style={formLineHeaderStyle}>{lineTitle(line, index)}</div>
        )}
        <table aria-label={`본문 파라미터 ${index + 1}`} style={formTableStyle}>
          <tbody>
            {line.map(([key, value], entryIndex) => (
              <tr key={`${key}-${entryIndex}`} style={queryRowStyle}>
                <td style={queryKeyStyle}>{key}</td>
                <td style={queryValueStyle}>
                  {value === "" ? "(empty)" : value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}
  </>
);

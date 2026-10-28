/**
 * 0~1 범위 비율 문자열을 숫자로 바꾼다.
 * - 없거나 빈 값이면 fallback
 * - 값이 있는데 0~1 범위 숫자가 아니면 경고를 남기고 fallback (`"10%"`, `"1.5"` 같은 설정 실수를 드러낸다)
 */
export function parseSampleRate(
  value: string | undefined,
  fallback: number,
  name = "sample rate"
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (parsed >= 0 && parsed <= 1) {
    return parsed;
  }
  console.warn(
    `[web-observability] ${name} "${value}" 는 0~1 범위 숫자가 아니어서 ${fallback} 을 씁니다.`
  );
  return fallback;
}

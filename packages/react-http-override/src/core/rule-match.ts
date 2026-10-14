/** 잘못된 정규식 패턴은 매칭 실패로 취급 */
export const ruleMatchesUrl = (pattern: string, url: string): boolean => {
  try {
    return new RegExp(pattern).test(url);
  } catch {
    return false;
  }
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const exactUrlPattern = (url: string): string =>
  `^${escapeRegExp(url)}$`;
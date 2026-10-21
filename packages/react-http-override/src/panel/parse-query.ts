const decode = (text: string): string => {
  const spaced = text.replace(/\+/g, " ");
  try {
    return decodeURIComponent(spaced);
  } catch {
    return spaced;
  }
};

export const parseQuery = (query: string): [string, string][] =>
  query
    .replace(/^\?/, "")
    .split("&")
    .filter((pair) => pair !== "")
    .map((pair) => {
      const index = pair.indexOf("=");
      return index === -1
        ? [decode(pair), ""]
        : [decode(pair.slice(0, index)), decode(pair.slice(index + 1))];
    });

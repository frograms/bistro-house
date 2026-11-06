/** 문자열은 `Ctrl+Shift+H` 같은 조합 키, 배열은 순서대로 누르는 키(`event.key` 이름), false는 끄기 */
export type HttpOverrideShortcut = false | readonly string[] | string;

export const DEFAULT_SHORTCUT = "Ctrl+Shift+H";

const SEQUENCE_TIMEOUT_MS = 2000;

const ARROW_KEYS_BY_CODE: Record<number, string> = {
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
};

const keyOf = (event: KeyboardEvent): string =>
  typeof event.key === "string" &&
  event.key !== "" &&
  event.key !== "Unidentified"
    ? event.key
    : (ARROW_KEYS_BY_CODE[event.keyCode] ?? "");

const codeOf = (event: KeyboardEvent): string =>
  typeof event.code === "string" ? event.code.toLowerCase() : "";

const MODIFIER_ALIASES: Record<string, "alt" | "ctrl" | "meta" | "shift"> = {
  alt: "alt",
  cmd: "meta",
  command: "meta",
  control: "ctrl",
  ctrl: "ctrl",
  meta: "meta",
  option: "alt",
  shift: "shift",
};

const createComboMatcher = (combo: string) => {
  const parts = combo.split("+").map((part) => part.trim().toLowerCase());
  const key = parts[parts.length - 1] ?? "";
  const modifiers = new Set<string>();
  const unknown = parts.slice(0, -1).filter((part) => {
    const modifier = MODIFIER_ALIASES[part];
    if (modifier !== undefined) modifiers.add(modifier);
    return modifier === undefined;
  });
  if (unknown.length > 0) {
    console.warn(
      `[react-http-override] 단축키 "${combo}"에 모르는 수식 키(${unknown.join(", ")})가 있어 단축키를 끕니다. Ctrl, Shift, Alt, Meta(Cmd)를 쓰세요.`
    );
    return () => false;
  }
  return (event: KeyboardEvent) =>
    event.altKey === modifiers.has("alt") &&
    event.ctrlKey === modifiers.has("ctrl") &&
    event.metaKey === modifiers.has("meta") &&
    event.shiftKey === modifiers.has("shift") &&
    // Alt 등으로 event.key가 바뀌어도 물리 키(event.code)로 맞춘다
    (keyOf(event).toLowerCase() === key || codeOf(event) === `key${key}`);
};

const createSequenceMatcher = (keys: readonly string[]) => {
  let recent: string[] = [];
  let lastAt = 0;
  return (event: KeyboardEvent) => {
    if (event.repeat) return false;
    const now = Date.now();
    if (now - lastAt > SEQUENCE_TIMEOUT_MS) recent = [];
    lastAt = now;
    recent = [...recent, keyOf(event)].slice(-keys.length);
    if (!keys.every((key, index) => recent[index] === key)) return false;
    recent = [];
    return true;
  };
};

/** 단축키가 꺼져 있으면 null */
export const createShortcutMatcher = (
  shortcut: HttpOverrideShortcut
): ((event: KeyboardEvent) => boolean) | null => {
  if (shortcut === false) return null;
  if (typeof shortcut === "string") return createComboMatcher(shortcut);
  return shortcut.length === 0 ? null : createSequenceMatcher(shortcut);
};

export const formatShortcut = (
  shortcut: HttpOverrideShortcut
): null | string => {
  if (shortcut === false) return null;
  if (typeof shortcut === "string") return shortcut;
  return shortcut.length === 0 ? null : shortcut.join(" ");
};

import { askQuestion } from "../../util/cli-utils";
import type { OptionInfoMap, OptionRawInput } from "./option-builder-types";

const readStringFromRaw = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const fillOptionRawInput = async <const T extends OptionInfoMap>(
  info: T,
  raw: Record<string, unknown>
): Promise<OptionRawInput<T>> => {
  const filled = {} as OptionRawInput<T>;
  const skipInteraction =
    "yes" in info && info.yes.type === "boolean" ? !!raw.yes : false;

  for (const key of Object.keys(info) as (keyof T & string)[]) {
    const init = info[key];

    if (init.type === "boolean") {
      filled[key] = !!raw[key] as OptionRawInput<T>[typeof key];
      continue;
    }

    if (init.type === "string[]") {
      const value = raw[key];
      if (Array.isArray(value)) {
        filled[key] = value as OptionRawInput<T>[typeof key];
      }
      continue;
    }

    let value = readStringFromRaw(raw[key]);

    if (init.required) {
      filled[key] = value as OptionRawInput<T>[typeof key];
      continue;
    }

    const { choices, defaultValue } = init;
    const oneOf = choices ? [...choices] : undefined;

    if (!value && !skipInteraction) {
      const answer = await askQuestion({
        defaultValue,
        description: defaultValue
          ? `${init.description} (기본값: ${defaultValue})`
          : init.description,
        oneOf,
        query: init.name,
      });
      const trimmed = answer.trim();
      value = trimmed.length > 0 ? trimmed : defaultValue;
    } else if (!value && skipInteraction) {
      value = defaultValue;
    }

    if (value === undefined && defaultValue !== undefined) {
      value = defaultValue;
    }

    if (value !== undefined) {
      filled[key] = value as OptionRawInput<T>[typeof key];
    }
  }

  return filled;
};

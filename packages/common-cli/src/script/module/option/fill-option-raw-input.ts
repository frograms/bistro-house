import { askQuestion } from "../../util/cli-utils";
import type {
  OptionInfoMap,
  OptionInit,
  OptionRawInput,
} from "./option-builder-types";

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

    if (!value && !skipInteraction) {
      const measuredDefault = init.cliDefault?.toString();
      const answer = await askQuestion({
        defaultValue: measuredDefault,
        description: measuredDefault
          ? `${init.description} (기본값: ${measuredDefault})`
          : init.description,
        query: init.name,
      });
      const trimmed = answer.trim();
      value = trimmed.length > 0 ? trimmed : init.cliDefault;
    } else if (!value && skipInteraction) {
      value = init.cliDefault;
    }

    if (init.inputRequired) {
      value = value ?? init.cliDefault;
    } else if (init.coerceEmpty) {
      value = value ?? "";
    }

    if (value !== undefined) {
      filled[key] = value as OptionRawInput<T>[typeof key];
    }
  }

  return filled;
};

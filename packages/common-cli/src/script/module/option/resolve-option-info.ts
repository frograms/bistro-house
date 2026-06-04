import { type ResolvedOptionInfo, toBuiltOption } from "./option";
import type { OptionInfoMap, OptionRawInput } from "./option-builder-types";

export const defineOptionInfo = <const T extends OptionInfoMap>(info: T): T =>
  info;

export const resolveOptionInfo = <const T extends OptionInfoMap>(
  info: T,
  raw: OptionRawInput<T>
): ResolvedOptionInfo<T> => {
  const resolved = {} as ResolvedOptionInfo<T>;

  for (const key of Object.keys(info) as (keyof T & string)[]) {
    const init = info[key];
    const value = raw[key];
    resolved[key] = toBuiltOption(
      init,
      value
    ) as ResolvedOptionInfo<T>[typeof key];
  }

  return resolved;
};

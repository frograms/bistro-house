import {
  type CustomResolvedOptionInfo,
  customToBuiltOption,
} from "./custom-option";
import type { OptionInfoMap, OptionRawInput } from "./custom-option-types";

export const defineOptionInfo = <const T extends OptionInfoMap>(info: T): T =>
  info;

export const resolveOptionInfo = <const T extends OptionInfoMap>(
  info: T,
  raw: OptionRawInput<T>
): CustomResolvedOptionInfo<T> => {
  const resolved = {} as CustomResolvedOptionInfo<T>;

  for (const key of Object.keys(info) as (keyof T & string)[]) {
    const init = info[key];
    resolved[key] = customToBuiltOption(
      init,
      raw[key]
    ) as CustomResolvedOptionInfo<T>[typeof key];
  }

  return resolved;
};

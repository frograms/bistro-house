import { CustomBuiltOption } from "./custom-option";
import type {
  BuiltOptionValue,
  CustomResolvedOptionInfo,
  OptionInitDef,
  OptionInit,
  OptionValueDef,
  OptionValue,
} from "./custom-option-types";

export const toCustomBuiltOption = <Init extends OptionInit>(
  init: Init,
  value: BuiltOptionValue<Init>
): CustomBuiltOption<Init> =>
  new CustomBuiltOption(
    init,
    (value ?? init.defaultValue) as OptionValue<Init> | undefined
  );

export const defineOptionInfo = <const T extends OptionInitDef>(info: T): T =>
  info;

export const resolveOptionInfo = <const T extends OptionInitDef>(
  info: T,
  raw: OptionValueDef<T>
): CustomResolvedOptionInfo<T> => {
  const resolved = {} as CustomResolvedOptionInfo<T>;

  for (const key of Object.keys(info) as (keyof T & string)[]) {
    const init = info[key];
    resolved[key] = toCustomBuiltOption(
      init,
      raw[key] as BuiltOptionValue<T[typeof key]>
    );
  }

  return resolved;
};

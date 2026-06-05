import { CustomBuiltOption } from "./custom-option";
import type {
  BuiltOptionValue,
  CustomResolvedOptionInfo,
  OptionInit,
  OptionInitDef,
  OptionValue,
  OptionValueDef,
} from "./custom-option-types";

type MatchOptionInitKeys<
  T extends OptionInit,
  V extends OptionInit = OptionInit,
> = Record<Exclude<keyof T, V extends V ? keyof V : never>, never>;

export const toCustomBuiltOption = <Init extends OptionInit>(
  init: Init,
  value: BuiltOptionValue<Init>
): CustomBuiltOption<Init> =>
  new CustomBuiltOption(
    init,
    (value ?? init.defaultValue) as OptionValue<Init> | undefined
  );

export const defineOptionInfo = <const T extends OptionInitDef>(
  info: T & { readonly [K in keyof T]: MatchOptionInitKeys<T[K]> }
): T => info;

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

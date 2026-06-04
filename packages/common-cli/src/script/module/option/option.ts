import type {
  BuiltOptionValue,
  OptionInfoMap,
  OptionInit,
  OptionValue,
  OptionValueArgs,
} from "./option-builder-types";

const isRequiredValueMissing = <Init extends OptionInit>(
  init: Init,
  value: OptionValue<Init> | undefined
): boolean => {
  if (init.required !== true) return false;
  if (value === undefined) return true;
  if (
    init.type === "string" &&
    typeof value === "string" &&
    value.length === 0
  ) {
    return true;
  }
  if (init.type === "string[]" && Array.isArray(value) && value.length === 0) {
    return true;
  }
  return false;
};

export const toBuiltOption = <Init extends OptionInit>(
  init: Init,
  value?: OptionValue<Init>
): BuiltOption<Init> =>
  new BuiltOption(init, value ?? (init.defaultValue as OptionValue<Init>));

export type ResolvedOptionInfo<T extends OptionInfoMap> = {
  [K in keyof T]: BuiltOption<T[K]>;
};

export class Option<Init extends OptionInit> {
  constructor(public init: Init) {}

  build(...args: OptionValueArgs<Init>): BuiltOption<Init> {
    return new BuiltOption(this.init, args[0] as OptionValue<Init> | undefined);
  }
}

export class BuiltOption<Init extends OptionInit> {
  constructor(
    public init: Init,
    value?: OptionValue<Init>
  ) {
    if (isRequiredValueMissing(init, value)) {
      throw new Error(`${init.name} 은(는) 필수입니다.`);
    }
    this.value = value as BuiltOptionValue<Init>;
  }

  public readonly value: BuiltOptionValue<Init>;
}

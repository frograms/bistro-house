import type {
  BuiltOptionValue,
  OptionInfoMap,
  OptionInit,
  OptionValue,
  OptionValueArgs,
} from "./custom-option-types";

const customIsRequiredValueMissing = <Init extends OptionInit>(
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

export const customToBuiltOption = <Init extends OptionInit>(
  init: Init,
  value?: OptionValue<Init>
): CustomBuiltOption<Init> =>
  new CustomBuiltOption(
    init,
    value ?? (init.defaultValue as OptionValue<Init>)
  );

export type CustomResolvedOptionInfo<T extends OptionInfoMap> = {
  [K in keyof T]: CustomBuiltOption<T[K]>;
};

export class CustomOption<Init extends OptionInit> {
  constructor(public init: Init) {}

  build(...args: OptionValueArgs<Init>): CustomBuiltOption<Init> {
    return new CustomBuiltOption(
      this.init,
      args[0] as OptionValue<Init> | undefined
    );
  }
}

export class CustomBuiltOption<Init extends OptionInit> {
  constructor(
    public init: Init,
    value?: OptionValue<Init>
  ) {
    if (customIsRequiredValueMissing(init, value)) {
      throw new Error(`${init.name} 은(는) 필수입니다.`);
    }
    this.value = value as BuiltOptionValue<Init>;
  }

  public readonly value: BuiltOptionValue<Init>;
}

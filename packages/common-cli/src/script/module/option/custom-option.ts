import type {
  BuiltOptionValue,
  OptionInit,
  OptionValue,
} from "./custom-option-types";

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

export class CustomOption<Init extends OptionInit> {
  constructor(public init: Init) {}

  build(value: BuiltOptionValue<Init>): CustomBuiltOption<Init> {
    return new CustomBuiltOption(
      this.init,
      value ?? (this.init.defaultValue as BuiltOptionValue<Init>)
    );
  }
}

export class CustomBuiltOption<Init extends OptionInit> {
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

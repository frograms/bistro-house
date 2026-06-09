import type {
  CustomResolvedOptionInfo,
  OptionInit,
  OptionInitDef,
} from "./custom-option-types";

const isRequiredValueMissing = (init: OptionInit, value: unknown): boolean => {
  if (init.required !== true) {
    return false;
  }
  if (value === undefined) {
    return true;
  }
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

const validateOption = (init: OptionInit, value: unknown) => {
  if (isRequiredValueMissing(init, value)) {
    throw new Error(`${init.name} 은(는) 필수입니다.`);
  }

  if (
    init.type === "string" &&
    init.choices &&
    typeof value === "string" &&
    !init.choices.includes(value)
  ) {
    throw new Error(
      `알 수 없는 값입니다: ${value} (${init.choices.join(", ")})`
    );
  }
};

export const validateOptionInfo = <T extends OptionInitDef>(
  optionInitDef: T,
  optionInfo: CustomResolvedOptionInfo<T>
): void => {
  for (const key of Object.keys(optionInitDef) as Array<keyof T & string>) {
    validateOption(optionInitDef[key], optionInfo[key].value);
  }
};

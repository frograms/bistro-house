import type { CustomBuiltOption } from "./custom-option";

export type OptionInit = {
  description: string;
  flags: string;
  name: string;
} &
  // boolean
  (| ({ defaultValue?: boolean } & (
        | { required: true; type: "boolean" }
        | { required?: false; type: "boolean" }
      ))
    // string
    | ({ choices?: readonly string[]; defaultValue?: string } & (
        | { required: true; type: "string" }
        | { required?: false; type: "string" }
      ))
    // string[]
    | ({ defaultValue?: string[] } & (
        | { required: true; type: "string[]" }
        | { required?: false; type: "string[]" }
      ))
  );

type StringOptionValue<Init extends OptionInit> = Init extends {
  choices: readonly string[];
}
  ? Init["choices"][number]
  : string;

export type OptionValue<Init extends OptionInit> = Init extends {
  type: "boolean";
}
  ? boolean
  : Init extends { type: "string" }
    ? StringOptionValue<Init>
    : Init extends { type: "string[]" }
      ? string[]
      : never;

export type BuiltOptionValue<Init extends OptionInit> = Init extends {
  required: true;
}
  ? OptionValue<Init>
  : Init extends { defaultValue: unknown }
    ? OptionValue<Init>
    : OptionValue<Init> | undefined;

export type OptionInitDef = { [K in string]: OptionInit };

export type OptionValueDef<T extends OptionInitDef> = {
  [K in keyof T]?: OptionValue<T[K]>;
};

export type CustomResolvedOptionInfo<T extends OptionInitDef> = {
  [K in keyof T]: CustomBuiltOption<T[K]>;
};

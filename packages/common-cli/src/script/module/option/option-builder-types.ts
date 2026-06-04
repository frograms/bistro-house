export type OptionInit = {
  choices?: readonly string[];
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
    | ({ defaultValue?: string } & (
        | { required: true; type: "string" }
        | { required?: false; type: "string" }
      ))
    // string[]
    | ({ defaultValue?: string[] } & (
        | { required: true; type: "string[]" }
        | { required?: false; type: "string[]" }
      ))
  );

export type OptionValue<Init extends OptionInit> = Init extends {
  type: "boolean";
}
  ? boolean
  : Init extends { type: "string" }
    ? string
    : Init extends { type: "string[]" }
      ? string[]
      : never;

export type BuiltOptionValue<Init extends OptionInit> = Init extends {
  required: true;
}
  ? OptionValue<Init>
  : OptionValue<Init> | undefined;

export type OptionValueArgs<Init extends OptionInit> = Init extends {
  required: true;
}
  ? [value: OptionValue<Init>]
  : [value?: OptionValue<Init>];

export type OptionInfoMap = { [K in string]: OptionInit };

export type OptionRawInput<T extends OptionInfoMap> = {
  [K in keyof T]?: OptionValue<T[K]>;
};

export type OptionValues<T extends OptionInfoMap> = {
  [K in keyof T]: BuiltOptionValue<T[K]>;
};

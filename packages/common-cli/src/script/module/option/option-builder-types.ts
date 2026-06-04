export type OptionInit = {
  choices?: readonly string[];
  cliDefault?: string;
  coerceEmpty?: boolean;
  description: string;
  flags: string;
  inputRequired?: boolean;
} & { name: string } & (
    | (
        | ({ type: "boolean" } & { required: true })
        | { required?: false; type: "boolean" }
      )
    | (
        | ({ type: "string" } & { required: true })
        | { required?: false; type: "string" }
      )
    | (
        | ({ type: "string[]" } & { required: true })
        | { required?: false; type: "string[]" }
      )
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

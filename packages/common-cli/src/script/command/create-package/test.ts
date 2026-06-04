/**
 * option-builder 프로토타입 — create-package 작업 마무리 전까지 유지.
 * 프로덕션 코드에서 import 하지 않음.
 */
type OptionInit = { description: string; name: string } & (
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

type OptionValue<Init extends OptionInit> = Init extends { type: "boolean" }
  ? boolean
  : Init extends { type: "string" }
    ? string
    : Init extends { type: "string[]" }
      ? string[]
      : never;

type BuiltOptionValue<Init extends OptionInit> = Init extends { required: true }
  ? OptionValue<Init>
  : OptionValue<Init> | undefined;

type OptionValueArgs<Init extends OptionInit> = Init extends { required: true }
  ? [value: OptionValue<Init>]
  : [value?: OptionValue<Init>];

type OptionInfoMap = { [K in string]: OptionInit & { name: K } };

type OptionRawInput<T extends OptionInfoMap> = {
  [K in keyof T]?: OptionValue<T[K]>;
};

type ResolvedOptionInfo<T extends OptionInfoMap> = {
  [K in keyof T]: BuiltOption<T[K]>;
};

const defineOptionInfo = <const T extends OptionInfoMap>(info: T): T => info;

class Option<Init extends OptionInit> {
  constructor(public init: Init) {}

  build(...args: OptionValueArgs<Init>): BuiltOption<Init> {
    return new BuiltOption(this.init, args[0] as OptionValue<Init> | undefined);
  }
}

class BuiltOption<Init extends OptionInit> {
  constructor(
    public init: Init,
    value?: OptionValue<Init>
  ) {
    if (value === undefined && init.required === true) {
      throw new Error(`${init.name} 은(는) 필수입니다.`);
    }
    this.value = value as BuiltOptionValue<Init>;
  }

  public readonly value: BuiltOptionValue<Init>;
}

const toBuiltOption = <Init extends OptionInit>(
  init: Init,
  value?: OptionValue<Init>
): BuiltOption<Init> => new BuiltOption(init, value);

const resolveOptionInfo = <const T extends OptionInfoMap>(
  info: T,
  raw: OptionRawInput<T>
): ResolvedOptionInfo<T> => {
  const resolved = {} as ResolvedOptionInfo<T>;

  for (const key of Object.keys(info) as (keyof T & string)[]) {
    const init = info[key];
    const value = raw[key];
    resolved[key] = toBuiltOption(
      init,
      value
    ) as ResolvedOptionInfo<T>[typeof key];
  }

  return resolved;
};

// 1. 옵션 정의 (키 === name)
const CREATE_PACKAGE_INIT_OPTION_INFO = defineOptionInfo({
  canPublish: {
    description: "배포용 package.json",
    name: "canPublish",
    type: "boolean",
  },
  test1: {
    description: "--t1, --test1",
    name: "test1",
    required: true,
    type: "string",
  },
});

// 2. 리졸브 → 키별 BuiltOption
const options = resolveOptionInfo(CREATE_PACKAGE_INIT_OPTION_INFO, {
  canPublish: true,
  test1: "hello",
});

void options.test1.value;
void options.canPublish.value;

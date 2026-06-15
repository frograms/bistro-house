import { Command } from "commander";

import { askQuestion } from "../../util/cli-utils";
import type {
  CustomResolvedOptionInfo,
  OptionInitDef,
  OptionValueDef,
} from "../option/custom-option-types";
import { resolveOptionInfo } from "../option/custom-option-utils";

const readStringFromRaw = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const fillOptionRawInput = async <const T extends OptionInitDef>(
  info: T,
  raw: Record<string, unknown>
): Promise<OptionValueDef<T>> => {
  const filled = {} as OptionValueDef<T>;
  const skipInteraction =
    "yes" in info && info.yes.type === "boolean" ? !!raw.yes : false;

  for (const key of Object.keys(info) as (keyof T & string)[]) {
    const init = info[key];
    if (!init) {
      console.warn(
        `⚠️  옵션 "${key}" 정의가 없어 입력값을 채우지 않습니다.`
      );
      continue;
    }

    if (init.type === "boolean") {
      filled[key] = !!raw[key] as OptionValueDef<T>[typeof key];
      continue;
    }

    if (init.type === "string[]") {
      const value = raw[key];
      if (Array.isArray(value)) {
        filled[key] = value as OptionValueDef<T>[typeof key];
      }
      continue;
    }

    let value = readStringFromRaw(raw[key]);

    if (init.required) {
      filled[key] = value as OptionValueDef<T>[typeof key];
      continue;
    }

    const { choices, defaultValue } = init;
    const oneOf = choices ? [...choices] : undefined;

    if (!value && !skipInteraction) {
      const answer = await askQuestion({
        defaultValue,
        description: defaultValue
          ? `${init.description} (기본값: ${defaultValue})`
          : init.description,
        oneOf,
        query: init.name,
      });
      const trimmed = answer.trim();
      value = trimmed.length > 0 ? trimmed : defaultValue;
    }

    if (value !== undefined) {
      filled[key] = value as OptionValueDef<T>[typeof key];
    }
  }

  return filled;
};

const applyOptionInfoToCommand = (
  command: Command,
  info: OptionInitDef
): Command => {
  for (const init of Object.values(info)) {
    if (init.type === "boolean") {
      command.option(init.flags, init.description);
      continue;
    }

    if (init.required) {
      command.requiredOption(init.flags, init.description);
    } else {
      command.option(init.flags, init.description);
    }
  }

  return command;
};

export class CustomCommand<const T extends OptionInitDef> extends Command {
  readonly optionInfo: T;

  constructor(name: string, optionInfo: T) {
    super(name);
    this.optionInfo = optionInfo;
    this.storeOptionsAsProperties(false);
    applyOptionInfoToCommand(this, this.optionInfo);
  }

  async resolveOptions(
    raw: Record<string, unknown>
  ): Promise<CustomResolvedOptionInfo<T>> {
    const filled = await fillOptionRawInput(this.optionInfo, raw);
    return resolveOptionInfo(this.optionInfo, filled);
  }

  action(
    handler: (options: CustomResolvedOptionInfo<T>) => void | Promise<void>
  ): this {
    return super.action(async (raw: Record<string, unknown>) => {
      const options = await this.resolveOptions(raw);
      await handler(options);
    });
  }
}

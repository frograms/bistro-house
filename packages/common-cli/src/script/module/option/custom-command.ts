import { Command } from "commander";

import { applyOptionInfoToCommand } from "./apply-option-info";
import { fillOptionRawInput } from "./fill-option-raw-input";
import type { ResolvedOptionInfo } from "./option";
import type { OptionInfoMap } from "./option-builder-types";
import { resolveOptionInfo } from "./resolve-option-info";

export class CustomCommand<const T extends OptionInfoMap> extends Command {
  readonly optionInfo: T;

  constructor(name: string, optionInfo: T) {
    super(name);
    this.optionInfo = optionInfo;
    this.storeOptionsAsProperties(false);
    applyOptionInfoToCommand(this, this.optionInfo);
  }

  async resolveOptions(
    raw: Record<string, unknown>
  ): Promise<ResolvedOptionInfo<T>> {
    const filled = await fillOptionRawInput(this.optionInfo, raw);
    return resolveOptionInfo(this.optionInfo, filled);
  }

  action(
    handler: (options: ResolvedOptionInfo<T>) => void | Promise<void>
  ): this {
    return super.action(async (raw: Record<string, unknown>) => {
      const options = await this.resolveOptions(raw);
      await handler(options);
    });
  }
}

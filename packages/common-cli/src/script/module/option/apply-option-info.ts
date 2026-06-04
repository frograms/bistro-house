import type { Command } from "commander";

import type { OptionInfoMap } from "./option-builder-types";

export const applyOptionInfoToCommand = (
  command: Command,
  info: OptionInfoMap
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

import { Command } from "commander";

/** Commander `.option` / `.requiredOption` 등록용 정의 */
export type CommandOptionDefinition = {
  description: string;
  flags: string;
  required?: boolean;
};

const registerCommandOptions = (
  command: Command,
  optionDefinitions: ReadonlyArray<CommandOptionDefinition>
) => {
  for (const definition of optionDefinitions) {
    if (definition.required) {
      command.requiredOption(definition.flags, definition.description);
    } else {
      command.option(definition.flags, definition.description);
    }
  }
};

let isCommandAddOptionsPatched = false;

/** Command에 `.addOptions()` 체이닝을 붙입니다. (Commander의 `options` 속성과 이름 충돌해 `addOptions` 사용) */
export const ensureCommandAddOptions = () => {
  if (isCommandAddOptionsPatched) return;

  Command.prototype.addOptions = function (
    this: Command,
    optionDefinitions: ReadonlyArray<CommandOptionDefinition>
  ) {
    registerCommandOptions(this, optionDefinitions);
    return this;
  };

  isCommandAddOptionsPatched = true;
};

declare module "commander" {
  interface Command {
    addOptions(
      optionDefinitions: ReadonlyArray<CommandOptionDefinition>
    ): this;
  }
}

ensureCommandAddOptions();

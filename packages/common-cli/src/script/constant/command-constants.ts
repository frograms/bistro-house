export const mainCommandInfo = {
  "create-package": "패키지를 생성합니다.",
} as const;

export type MainCommand = keyof typeof mainCommandInfo;
export type MainCommandValue =
  (typeof mainCommandInfo)[keyof typeof mainCommandInfo];

export const mainCommands: Array<{
  command: string;
  description: string;
}> = Object.entries(mainCommandInfo).map(([key, description]) => ({
  command: key,
  description,
}));

export const mainCommandKeys: Array<string> = mainCommands.map(
  (mainCommand) => mainCommand.command
);

export const mainCommandValues: Array<string> = mainCommands.map(
  (mainCommand) => mainCommand.description
);

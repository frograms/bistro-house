import { spawnSync } from "child_process";

import type { CreatePackageOptionInfo } from "../command/create-package/create-package-context";

export const runShellAction = (action: string, cwd: string) => {
  const parts = action.trim().split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  if (!command) {
    throw new Error(`Shell action 을 실행할 수 없습니다. command 가 없습니다.`);
  }

  spawnSync(command, args, { cwd, stdio: "inherit" });
};

export const toRecord = (
  options: CreatePackageOptionInfo
): Record<string, string> => {
  const overwrites: Record<string, string> = {};

  for (const key of Object.keys(options)) {
    const { init, value } = options[key as keyof CreatePackageOptionInfo];
    if (value === undefined) continue;
    overwrites[init.name] = String(value);
  }

  return overwrites;
};

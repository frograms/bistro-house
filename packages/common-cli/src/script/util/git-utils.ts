import { spawnSync } from "child_process";

/** git config --get 값. 없거나 실패 시 undefined */
export const readGitConfig = (key: string): string | undefined => {
  const result = spawnSync("git", ["config", "--get", key], {
    encoding: "utf8",
  });
  const value = result.stdout?.trim();
  return value || undefined;
};

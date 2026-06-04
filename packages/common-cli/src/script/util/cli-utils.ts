import readline from "readline";

export async function* questions(query: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    for (;;) {
      yield new Promise<string>((resolve) => rl.question(query, resolve));
    }
  } finally {
    rl.close();
  }
}

interface AskQuestionArgs {
  query: string;
  description?: string;
  isRequire?: boolean; // default false
  defaultValue?: string; // default empty string
  oneOf?: Array<string>;
}
export async function askQuestion({
  defaultValue = "",
  description,
  isRequire = false,
  oneOf,
  query,
}: AskQuestionArgs): Promise<string> {
  const withOneOf = (oneOf?.length ?? 0) > 0;
  for await (const answer of questions(
    `${description ? `${description}\n` : ""}> ${isRequire ? "*" : ""}${query}${withOneOf ? ` (${oneOf?.join("/")})` : ""}: `
  )) {
    if (isRequire) {
      if (answer) {
        return answer;
      }
    } else if (withOneOf) {
      if (oneOf?.includes(answer)) {
        return answer;
      }
    } else {
      return answer || defaultValue;
    }
  }
  return defaultValue;
}

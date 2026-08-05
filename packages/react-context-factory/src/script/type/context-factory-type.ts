import type { Context } from "react";

export type CreateContextProviderArgs<ContextActions> = {
  context: Context<ContextActions>;
};

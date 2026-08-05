import {
  createContext as createReactContext,
  type JSX,
  type ReactNode,
  useContext,
} from "react";

import type { CreateContextProviderArgs } from "../../script/type/context-factory-type";

type BaseContextProps = {
  children?: ReactNode;
};

type CreateContextArgs<
  ContextActions,
  ContextProps extends BaseContextProps,
> = {
  providerComponent: ({
    context,
  }: CreateContextProviderArgs<ContextActions>) => (
    props: ContextProps
  ) => JSX.Element;
};

/** Context, Provider, Consumer, use 훅을 한 번에 생성하는 팩토리 */
export const createContext = <
  ContextActions,
  ContextProps extends BaseContextProps,
>({
  providerComponent,
}: CreateContextArgs<ContextActions, ContextProps>) => {
  const context = createReactContext<ContextActions>({} as ContextActions);

  return {
    Consumer: context.Consumer,
    Context: context,
    Provider: providerComponent({ context }),
    use: () => useContext(context) as ContextActions,
  };
};

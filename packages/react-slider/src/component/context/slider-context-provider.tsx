import { type SlideTriggerEvent } from "../../script/type/slider-types";
import { SliderItemContext } from "./slider-context";

export type SliderItemContextProviderActions = {
  /**
   * - 즉각 반영 여부 (true: CSS transition 없이, false: CSS transition 적용)
   */
  immediate: boolean;
  isFocused: boolean;
  itemIndex: number;
  slideTriggerEvent: SlideTriggerEvent;
  /**
   * - 중앙으로부터의 거리 비율 (0~1)
   */
  transition: number;
};

export type SliderItemContextProviderProps = {
  children: React.ReactNode;
} & SliderItemContextProviderActions;

export const SliderItemContextProvider = ({
  children,
  immediate,
  isFocused,
  itemIndex,
  slideTriggerEvent,
  transition,
}: SliderItemContextProviderProps) => {
  const value: SliderItemContextProviderActions = {
    immediate,
    isFocused,
    itemIndex,
    slideTriggerEvent,
    transition,
  };

  return (
    <SliderItemContext.Provider value={value}>
      {children}
    </SliderItemContext.Provider>
  );
};

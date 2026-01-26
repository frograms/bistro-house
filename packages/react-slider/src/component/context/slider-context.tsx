import React from "react";

import type { SliderItemContextProviderActions } from "./slider-context-provider";

export const SliderItemContext =
  React.createContext<SliderItemContextProviderActions | null>(null);

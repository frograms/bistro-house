import "@packages/react-slider/src/resource/css/common/slider.css";

import { CommonContainer } from "@playground/component/view/_common/common-container";
import { ReactSliderSection } from "@playground/component/view/package/react-slider/_shared/react-slider-section";

export const ReactSliderSingleContainer = () => {
  return (
    <CommonContainer>
      <ReactSliderSection variant="single" />
    </CommonContainer>
  );
};

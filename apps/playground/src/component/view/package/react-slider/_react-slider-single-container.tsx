import "@packages/react-slider/src/resource/css/common/slider.css";

import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import { ReactSliderSection } from "@playground/component/view/package/react-slider/_shared/react-slider-section";

export const ReactSliderSingleContainer = () => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-slider">
      <ReactSliderSection variant="single" />
    </section>
  );
};

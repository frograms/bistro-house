import "@watcha-authentic/react-slider/resource/css/common/slider.css";

import { commonExampleCss } from "../../_common/common-example.css";
import { ReactSliderSection } from "./_shared/react-slider-section";

export const ReactSliderSingleContainer = () => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-slider">
      <ReactSliderSection variant="single" />
    </section>
  );
};

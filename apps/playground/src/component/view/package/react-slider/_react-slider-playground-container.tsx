import "@watcha-authentic/react-slider/resource/css/common/slider.css";

import { commonExampleCss } from "../../_common/common-example.css";
import { ReactSliderBasicSection } from "./_shared/react-slider-basic-section";

type ReactSliderPlaygroundContainerProps = {
  variant: "peek" | "single";
};

export const ReactSliderPlaygroundContainer = ({
  variant,
}: ReactSliderPlaygroundContainerProps) => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-slider">
      <ReactSliderBasicSection variant={variant} />
    </section>
  );
};

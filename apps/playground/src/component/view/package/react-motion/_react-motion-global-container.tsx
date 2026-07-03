import { commonExampleCss } from "../../_common/common-example.css";
import { ReactMotionGlobalSection } from "./react-motion-global-section";

export const ReactMotionGlobalContainer = () => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-motion">
      <ReactMotionGlobalSection />
    </section>
  );
};

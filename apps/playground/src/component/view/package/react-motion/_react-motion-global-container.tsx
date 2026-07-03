import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import { ReactMotionGlobalSection } from "@playground/component/view/package/react-motion/react-motion-global-section";

export const ReactMotionGlobalContainer = () => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-motion">
      <ReactMotionGlobalSection />
    </section>
  );
};

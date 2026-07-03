import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import { ReactMotionPointerSection } from "@playground/component/view/package/react-motion/react-motion-pointer-section";

export const ReactMotionPointerContainer = () => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-motion">
      <ReactMotionPointerSection />
    </section>
  );
};

import { commonExampleCss } from "../../_common/common-example.css";
import { ReactMotionPointerSection } from "./react-motion-pointer-section";

export const ReactMotionPointerContainer = () => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-motion">
      <ReactMotionPointerSection />
    </section>
  );
};

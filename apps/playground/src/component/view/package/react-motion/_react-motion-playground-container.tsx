import { commonExampleCss } from "../../_common/common-example.css";
import { ReactMotionGlobalSection } from "./_shared/react-motion-global-section";
import { ReactMotionPointerSection } from "./_shared/react-motion-pointer-section";

type ReactMotionPlaygroundContainerProps = {
  variant: "global" | "pointer";
};

export const ReactMotionPlaygroundContainer = ({
  variant,
}: ReactMotionPlaygroundContainerProps) => {
  return (
    <section className={commonExampleCss.packagePlayground} id="react-motion">
      {variant === "global" ? (
        <ReactMotionGlobalSection />
      ) : (
        <ReactMotionPointerSection />
      )}
    </section>
  );
};

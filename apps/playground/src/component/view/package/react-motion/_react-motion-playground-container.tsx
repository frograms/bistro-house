import { commonPlaygroundExampleCss } from "../../_common/common-playground-example.css";
import { ReactMotionGlobalSection } from "./_shared/react-motion-global-section";
import { ReactMotionPointerSection } from "./_shared/react-motion-pointer-section";

type ReactMotionPlaygroundContainerProps = {
  variant: "global" | "pointer";
};

export const ReactMotionPlaygroundContainer = ({
  variant,
}: ReactMotionPlaygroundContainerProps) => {
  return (
    <section className={commonPlaygroundExampleCss.packagePlayground} id="react-motion">
      {variant === "global" ? (
        <ReactMotionGlobalSection />
      ) : (
        <ReactMotionPointerSection />
      )}
    </section>
  );
};

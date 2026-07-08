import { statusContainerCss } from "@playground/component/view/_common/_status-container.css";

export const ErrorContainer = () => {
  return (
    <section className={statusContainerCss.wrap}>
      <div aria-hidden="true" className={statusContainerCss.character}>
        :(
      </div>
      <h2>일시적인 오류가 발생했습니다.</h2>
      <p>잠시 후 다시 시도하거나 홈에서 패키지 가이드를 살펴보세요.</p>
    </section>
  );
};

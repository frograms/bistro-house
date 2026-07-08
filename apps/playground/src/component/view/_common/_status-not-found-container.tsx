import { statusContainerCss } from "@playground/component/view/_common/_status-container.css";

export const NotFoundContainer = () => {
  return (
    <section className={statusContainerCss.wrap}>
      <div aria-hidden="true" className={statusContainerCss.character}>
        :(
      </div>
      <h2>페이지를 찾을 수 없습니다.</h2>
      <p>주소를 다시 확인하거나 홈에서 패키지 가이드를 살펴보세요.</p>
    </section>
  );
};

import { Link } from "react-router";

import { PLAYGROUND_PAGES } from "../../../script/config/playground-page-config";
import { homeContainerCss } from "./home-container.css";

const PACKAGE_CARD_PAGES = PLAYGROUND_PAGES.filter((page, index, pages) => {
  return pages.findIndex((item) => item.packageName === page.packageName) === index;
});

export const HomeContainer = () => {
  return (
    <section className={homeContainerCss.section}>
      <div className={homeContainerCss.intro}>
        <h2>패키지별 가이드를 살펴보세요.</h2>
        <p>
          좌측 메뉴 또는 아래 카드에서 패키지를 선택하면 문서와 예제를 함께
          확인할 수 있습니다.
        </p>
      </div>

      <div className={homeContainerCss.exampleGrid}>
        {PACKAGE_CARD_PAGES.map((page) => (
          <Link
            key={page.packageName}
            className={homeContainerCss.exampleLink}
            to={page.path}>
            <small>{page.packageName}</small>
            <strong>{page.packageLabel}</strong>
            <span>{page.packageDescription}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

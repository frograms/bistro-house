import { Link } from "react-router";

import { MENU_INFO } from "../../../script/config/menu-info-config";
import { homeContainerCss } from "./_home-container.css";

const WATCHA_AUTHENTIC_NPM_ORG_URL =
  "https://www.npmjs.com/org/watcha-authentic";

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

      <a
        className={homeContainerCss.npmOrgLink}
        href={WATCHA_AUTHENTIC_NPM_ORG_URL}
        rel="noreferrer"
        target="_blank">
        <strong>WATCHA가 만든 더 많은 패키지 보기</strong>
        <span aria-hidden="true">↗</span>
      </a>

      <div className={homeContainerCss.exampleGrid}>
        {MENU_INFO.map((menuInfo) => (
          <Link
            key={menuInfo.packageName}
            className={homeContainerCss.exampleLink}
            to={menuInfo.path}>
            <small>{menuInfo.packageName}</small>
            <strong>{menuInfo.packageLabel}</strong>
            <span>{menuInfo.packageDescription}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

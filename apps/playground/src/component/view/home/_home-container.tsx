import { homeContainerCss } from "@playground/component/view/home/_home-container.css";
import { MENU_INFO } from "@playground/script/config/menu-info-config";
import { Link } from "react-router";

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
        {MENU_INFO.length === 0 ? (
          <div className={homeContainerCss.emptyPackageCard}>
            <div aria-hidden="true">:3</div>
            <strong>아직 표시할 패키지가 없습니다.</strong>
            <p>패키지가 추가되면 이 영역에 가이드 카드가 표시됩니다.</p>
          </div>
        ) : (
          MENU_INFO.map((menuInfo) => (
            <Link
              key={menuInfo.packageName}
              className={homeContainerCss.exampleLink}
              to={menuInfo.path}>
              <small>{menuInfo.packageName}</small>
              <strong>{menuInfo.packageLabel}</strong>
              <span>{menuInfo.packageDescription}</span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
};

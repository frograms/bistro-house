import { commonSidebarCss } from "@playground/component/view/_common/common-sidebar.css";
import { useEffect, useId, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

export type CommonSidebarItem = {
  label: string;
  to: string;
};

export type CommonSidebarSection = {
  items: ReadonlyArray<CommonSidebarItem>;
  label: string;
  to: string;
};

type CommonSidebarProps = {
  sections: ReadonlyArray<CommonSidebarSection>;
};

const WATCHA_ICON_SRC = `${import.meta.env.BASE_URL}images/watcha-icon.png`;

export const CommonSidebar = ({ sections }: CommonSidebarProps) => {
  const location = useLocation();
  const navigationId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 모바일에서 페이지 전환 시에는 사이드 메뉴를 항상 닫습니다.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // 모바일 메뉴가 열리면 body 스크롤을 잠시 고정합니다.
  useEffect(() => {
    if (!isMenuOpen || !window.matchMedia("(max-width: 720px)").matches) {
      return;
    }

    const { scrollY } = window;
    const { body } = document;
    const prevBodyStyle = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = prevBodyStyle.overflow;
      body.style.position = prevBodyStyle.position;
      body.style.top = prevBodyStyle.top;
      body.style.width = prevBodyStyle.width;
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  return (
    <aside className={commonSidebarCss.wrap}>
      <div className={commonSidebarCss.header}>
        <Link className={commonSidebarCss.brandLink} to="/">
          <img
            alt=""
            className={commonSidebarCss.brandIcon}
            src={WATCHA_ICON_SRC}
          />
          <span className={commonSidebarCss.brandText}>WATCHA Packages</span>
        </Link>

        <button
          aria-controls={navigationId}
          aria-expanded={isMenuOpen}
          className={commonSidebarCss.menuButton}
          type="button"
          onClick={() => {
            setIsMenuOpen((prev) => !prev);
          }}>
          <span aria-hidden="true" />
          Menu
        </button>
      </div>

      <button
        aria-label="메뉴 닫기"
        className={commonSidebarCss.backdrop}
        data-state={isMenuOpen ? "open" : "closed"}
        type="button"
        onClick={() => {
          setIsMenuOpen(false);
        }}
      />

      <nav
        aria-label="패키지 예제 메뉴"
        data-state={isMenuOpen ? "open" : "closed"}
        id={navigationId}>
        <div className={commonSidebarCss.navScrollArea}>
          {sections.map((section) => (
            <section key={section.to} className={commonSidebarCss.section}>
              <div className={commonSidebarCss.sectionHeader}>
                <NavLink
                  className={commonSidebarCss.sectionHeaderLink}
                  to={section.to}>
                  {section.label}
                </NavLink>
              </div>

              <div className={commonSidebarCss.menu}>
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to}>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </section>
          ))}
        </div>
      </nav>
    </aside>
  );
};

import { useEffect, useId, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { commonSidebarCss } from "./common-sidebar.css";

export type CommonMenuItem = {
  description: string;
  exampleId: string;
  exampleLabel: string;
  isDocumentation?: boolean;
  packageLabel: string;
  packageName: string;
  path: string;
};

type CommonSidebarProps = {
  items: ReadonlyArray<CommonMenuItem>;
};

type CommonSidebarSection = {
  documentationPath: string;
  items: Array<CommonMenuItem>;
  packageLabel: string;
  packageName: string;
};

const WATCHA_ICON_SRC = "/images/watcha-icon.png";

export const CommonSidebar = ({ items }: CommonSidebarProps) => {
  const location = useLocation();
  const navigationId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sections = useMemo(() => {
    return items.reduce<Array<CommonSidebarSection>>((acc, item) => {
      const section = acc.find(
        ({ packageName }) => packageName === item.packageName
      );
      const isDocumentationItem = item.isDocumentation === true;

      if (section) {
        if (isDocumentationItem) {
          section.documentationPath = item.path;
          return acc;
        }

        section.items.push(item);
        return acc;
      }

      acc.push({
        documentationPath: isDocumentationItem ? item.path : item.path,
        items: isDocumentationItem ? [] : [item],
        packageLabel: item.packageLabel,
        packageName: item.packageName,
      });
      return acc;
    }, []);
  }, [items]);

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
            <section
              key={section.packageName}
              className={commonSidebarCss.section}>
              <div className={commonSidebarCss.sectionHeader}>
                <NavLink
                  className={commonSidebarCss.sectionHeaderLink}
                  to={section.documentationPath}>
                  {section.packageLabel}
                </NavLink>
              </div>

              <div className={commonSidebarCss.menu}>
                {section.items.map((item) => (
                  <NavLink key={item.exampleId} to={item.path}>
                    <span>{item.exampleLabel}</span>
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

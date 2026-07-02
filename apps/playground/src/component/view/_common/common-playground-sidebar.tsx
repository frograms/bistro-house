import { useEffect, useId, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { commonPlaygroundSidebarCss } from "./common-playground-sidebar.css";

export type CommonPlaygroundMenuItem = {
  description: string;
  exampleId: string;
  exampleLabel: string;
  packageLabel: string;
  packageName: string;
  path: string;
};

type CommonPlaygroundSidebarProps = {
  items: ReadonlyArray<CommonPlaygroundMenuItem>;
};

type CommonPlaygroundSidebarSection = {
  items: Array<CommonPlaygroundMenuItem>;
  packageLabel: string;
  packageName: string;
};

const WATCHA_ICON_SRC = "/images/watcha-icon.png";

export const CommonPlaygroundSidebar = ({
  items,
}: CommonPlaygroundSidebarProps) => {
  const location = useLocation();
  const navigationId = useId();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const sections = useMemo(() => {
    return items.reduce<Array<CommonPlaygroundSidebarSection>>((acc, item) => {
      const section = acc.find(
        ({ packageName }) => packageName === item.packageName
      );

      if (section) {
        section.items.push(item);
        return acc;
      }

      acc.push({
        items: [item],
        packageLabel: item.packageLabel,
        packageName: item.packageName,
      });
      return acc;
    }, []);
  }, [items]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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
    <aside className={commonPlaygroundSidebarCss.wrap}>
      <div className={commonPlaygroundSidebarCss.header}>
        <Link className={commonPlaygroundSidebarCss.brandLink} to="/">
          <img
            alt=""
            className={commonPlaygroundSidebarCss.brandIcon}
            src={WATCHA_ICON_SRC}
          />
          <span className={commonPlaygroundSidebarCss.brandText}>
            WATCHA Packages
          </span>
        </Link>

        <button
          aria-controls={navigationId}
          aria-expanded={isMenuOpen}
          className={commonPlaygroundSidebarCss.menuButton}
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
        className={commonPlaygroundSidebarCss.backdrop}
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
        <div className={commonPlaygroundSidebarCss.navScrollArea}>
          {sections.map((section) => (
            <section
              key={section.packageName}
              className={commonPlaygroundSidebarCss.section}>
              <div className={commonPlaygroundSidebarCss.sectionHeader}>
                <p>{section.packageLabel}</p>
              </div>

              <div className={commonPlaygroundSidebarCss.menu}>
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

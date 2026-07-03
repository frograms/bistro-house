import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import { appContentCss } from "../../app-content.css";

type PageTocItem = {
  depth: 1 | 2 | 3 | 4;
  id: string;
  title: string;
};

type CommonPageTocProps = {
  targetElementId: string;
};

const getPageTocItems = (targetElementId: string): Array<PageTocItem> => {
  const targetElement = document.getElementById(targetElementId);

  if (!targetElement) {
    return [];
  }

  return [
    ...targetElement.querySelectorAll<HTMLElement>("[data-playground-toc]"),
  ]
    .map((element) => {
      const depth = Number(element.dataset.playgroundTocDepth);
      const title = element.dataset.playgroundTocTitle ?? element.textContent;

      if (
        !element.id ||
        !title ||
        (depth !== 1 && depth !== 2 && depth !== 3 && depth !== 4)
      ) {
        return null;
      }

      return {
        depth,
        id: element.id,
        title,
      };
    })
    .filter((item): item is PageTocItem => item !== null);
};

export const CommonPageToc = ({ targetElementId }: CommonPageTocProps) => {
  const location = useLocation();
  const [items, setItems] = useState<Array<PageTocItem>>([]);

  useEffect(() => {
    const targetElement = document.getElementById(targetElementId);
    const updateItems = () => {
      setItems(getPageTocItems(targetElementId));
    };
    const frame = window.requestAnimationFrame(updateItems);
    const observer = new MutationObserver(updateItems);

    if (targetElement) {
      observer.observe(targetElement, {
        attributeFilter: [
          "data-playground-toc",
          "data-playground-toc-depth",
          "data-playground-toc-title",
          "id",
        ],
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [location.pathname, targetElementId]);

  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="페이지 목차" className={appContentCss.pageToc}>
      <ol>
        {items.map((item) => (
          <li key={item.id} data-depth={item.depth}>
            <a href={`#${item.id}`}>{item.title}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export const appendPanelContainer = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.setAttribute("data-http-override", "");
  document.body.appendChild(container);
  return container;
};

/* React가 하이드레이션 폴백이나 body 재렌더로 모르는 노드를 걷어내면 컨테이너가 떨어져 나간다.
   같은 엘리먼트를 다시 붙이면 그 안의 React 루트는 그대로 살아 있다 */
export const keepPanelAttached = (container: HTMLElement): (() => void) => {
  let scheduled = false;
  const reattach = () => {
    scheduled = false;
    if (!container.isConnected) document.body.appendChild(container);
  };
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(reattach);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
  };
};

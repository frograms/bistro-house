export const appendPanelContainer = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.setAttribute("data-http-override", "");
  document.body.appendChild(container);
  return container;
};

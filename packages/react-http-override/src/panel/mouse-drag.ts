/** Pointer Events가 없는 구형 브라우저(구형 TV 웹 런타임)에서는 마우스 이벤트로 드래그 */
export const SUPPORTS_POINTER_EVENTS =
  typeof window !== "undefined" && "PointerEvent" in window;

export const trackMouseDrag = (
  onMove: (event: MouseEvent) => void,
  onEnd: () => void
): (() => void) => {
  const stop = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", handleUp);
  };
  const handleUp = () => {
    stop();
    onEnd();
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", handleUp);
  return stop;
};

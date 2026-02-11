export type AccessibilityOptions<ElementType extends HTMLElement> = {
  /**
   * - 포커스 복귀 대상 element 의 ref 값입니다.
   */
  returnTarget?:
    | Document
    | React.RefObject<ElementType | null>
    | "last-active-element";
  /**
   * - 자동 포커스 여부 (기본값: false)
   */
  withAutoFocus?: boolean;
};

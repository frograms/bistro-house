/**
 * 라이트 어피어런스 값.
 */
export type LightAppearanceName = "light";

/**
 * 다크 어피어런스 값.
 */
export type DarkAppearanceName = "dark";

/**
 * OS 어피어런스를 따를 때 쓰는 값.
 */
export type SystemAppearanceName = "system-appearance";

/**
 * OS가 알려 주는 색 테마.
 */
export type SystemAppearance = DarkAppearanceName | LightAppearanceName;

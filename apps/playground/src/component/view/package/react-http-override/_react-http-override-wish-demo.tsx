import { reactHttpOverrideObserveAndMockContainerCss as css } from "@playground/component/view/package/react-http-override/_react-http-override-observe-and-mock-container.css";
import { useCallback, useState } from "react";

const DEMO_API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
const WISH_CONTENT_CODE = "m5aV9mp";
const WISH_URL = `${DEMO_API_BASE}/contents/${WISH_CONTENT_CODE}/wishes`;

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const parsed = (await response.json()) as { message?: string };
    if (parsed.message !== undefined) return parsed.message;
  } catch {
    // body가 JSON이 아니면 기본 메시지
  }
  return `HTTP ${response.status}`;
};

/* 실서비스 찜 버튼과 같은 구조: 누르는 즉시 상태를 바꾸고, 실패하면 되돌린 뒤 에러를 알린다 */
export const WishDemo = () => {
  const [wished, setWished] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleWish = useCallback(async () => {
    const next = !wished;
    setWished(next);
    setPending(true);
    setError(null);
    try {
      const response = await fetch(WISH_URL, {
        method: next ? "POST" : "DELETE",
      });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
    } catch (caught) {
      setWished(!next);
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }, [wished]);

  const idleLabel = wished ? "찜 해제" : "찜하기";
  const buttonLabel = pending ? "요청 중" : idleLabel;

  return (
    <div className={css.wishCard}>
      <div className={css.wishHeader}>
        <span className={css.contentTitle}>달빛 조사관</span>
        <button
          className={wished ? css.wishButtonOn : css.wishButton}
          disabled={pending}
          type="button"
          onClick={() => {
            void toggleWish();
          }}>
          {buttonLabel}
        </button>
      </div>
      <p className={css.contentMeta}>
        {wished ? "DELETE" : "POST"} /api/contents/{WISH_CONTENT_CODE}/wishes
      </p>
      {error !== null && (
        <p className={css.wishError} role="alert">
          찜하지 못했어요. {error}
        </p>
      )}
    </div>
  );
};

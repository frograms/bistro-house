import { usePointerMoveGlobal } from "@packages/react-motion/src/component/hook/use-pointer-move-global";
import type { Point2D } from "@packages/react-motion/src/script/type/primitives";
import { addPoint } from "@packages/react-motion/src/script/util/point-utils";
import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import { CommonNote } from "@playground/component/view/_common/common-note";
import { reactMotionGlobalSectionCss } from "@playground/component/view/package/react-motion/react-motion-global-section.css";
import { useCallback, useRef, useState } from "react";

const DEFAULT_POINT: Point2D = { x: 0, y: 0 };

export const ReactMotionGlobalSection = () => {
  const target = useRef<HTMLDivElement>(null);
  const originPoint = useRef<Point2D>(DEFAULT_POINT);

  const [currentPoint, setCurrentPoint] = useState<Point2D>(DEFAULT_POINT);
  const [distance, setDistance] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const handleResetClick = useCallback(() => {
    originPoint.current = DEFAULT_POINT;
    setCurrentPoint(DEFAULT_POINT);
    setDistance(0);
  }, []);

  const { withPointerMove } = usePointerMoveGlobal<HTMLDivElement>({
    enabled,
    onDraggingNow: setIsDragging,
    onPointDrag: ({ isEnd, transaction }) => {
      const calculate = transaction.primaryPointer?.calculate;
      if (!calculate) {
        return;
      }

      const nextPoint = addPoint(originPoint.current, calculate.diff);
      setCurrentPoint(nextPoint);
      setDistance(Math.round(calculate.distance));

      if (isEnd) {
        originPoint.current = nextPoint;
      }
    },
    target,
  });

  return (
    <section className={commonExampleCss.exampleSection}>
      <CommonNote
        items={[
          "드래그를 시작한 뒤 포인터가 카드 밖으로 나가도 전역 이벤트로 이동과 종료 상태를 계속 추적합니다.",
        ]}
      />

      <div className={commonExampleCss.controlPanel}>
        <p className={commonExampleCss.controlPanelTitle}>컨트롤</p>
        <div className={commonExampleCss.buttonGroup}>
          <button type="button" onClick={handleResetClick}>
            위치 초기화
          </button>
        </div>

        <label className={commonExampleCss.checkboxField}>
          <input
            checked={enabled}
            type="checkbox"
            onChange={(event) => {
              setEnabled(event.target.checked);
            }}
          />
          <span>전역 포인터 이벤트 연결</span>
        </label>
      </div>

      <div className={reactMotionGlobalSectionCss.stage}>
        <div className={reactMotionGlobalSectionCss.stageGuide}>
          카드를 잡고 움직인 뒤, 카드 바깥 영역까지 드래그해 보세요.
        </div>
        <div
          ref={withPointerMove.ref}
          className={reactMotionGlobalSectionCss.dragBox}
          style={{
            ...withPointerMove.style,
            transform: `translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0)`,
          }}>
          Global
        </div>
      </div>

      <dl className={commonExampleCss.statePanel}>
        <div className={commonExampleCss.statePanelTitle}>
          <dt>현재 상태</dt>
        </div>
        <div>
          <dt>x</dt>
          <dd>{Math.round(currentPoint.x)}</dd>
        </div>
        <div>
          <dt>y</dt>
          <dd>{Math.round(currentPoint.y)}</dd>
        </div>
        <div>
          <dt>distance</dt>
          <dd>{distance}</dd>
        </div>
        <div>
          <dt>드래그 중</dt>
          <dd>{isDragging ? "true" : "false"}</dd>
        </div>
      </dl>
    </section>
  );
};

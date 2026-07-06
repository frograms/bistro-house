import { usePointerMove } from "@packages/react-motion/src/component/hook/use-pointer-move";
import type { Point2D } from "@packages/react-motion/src/script/type/primitives";
import { addPoint } from "@packages/react-motion/src/script/util/point-utils";
import { commonExampleCss } from "@playground/component/view/_common/common-example.css";
import { reactMotionPointerSectionCss } from "@playground/component/view/package/react-motion/react-motion-pointer-section.css";
import { useCallback, useRef, useState } from "react";

const DEFAULT_POINT: Point2D = { x: 0, y: 0 };

export const ReactMotionPointerSection = () => {
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

  const { withPointerMove } = usePointerMove<HTMLDivElement>({
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
          <span>포인터 이벤트 연결</span>
        </label>
      </div>

      <div className={reactMotionPointerSectionCss.stage}>
        <div
          {...withPointerMove}
          className={reactMotionPointerSectionCss.dragBox}
          style={{
            ...withPointerMove.style,
            transform: `translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0)`,
          }}>
          Drag
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

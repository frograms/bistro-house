import { usePointerMove } from "@packages/react-motion/src/component/hook/use-pointer-move";
import type { Point2D } from "@packages/react-motion/src/script/type/primitives";
import { addPoint } from "@packages/react-motion/src/script/util/point-utils";
import { CommonContainer } from "@playground/component/view/_common/common-container";
import {
  CommonExampleControlPanel,
  CommonExampleStagePanel,
  CommonExampleStatePanel,
} from "@playground/component/view/_common/common-example-panels";
import { reactMotionPointerContainerCss } from "@playground/component/view/package/react-motion/_react-motion-pointer-container.css";
import { commonExampleControlsCss } from "@playground/resource/css/common/common-example-controls.css";
import { useCallback, useRef, useState } from "react";

const DEFAULT_POINT: Point2D = { x: 0, y: 0 };

export const ReactMotionPointerContainer = () => {
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
    <CommonContainer>
      <CommonExampleControlPanel>
        <div className={commonExampleControlsCss.controlGroup}>
          <button type="button" onClick={handleResetClick}>
            위치 초기화
          </button>
        </div>

        <label className={commonExampleControlsCss.checkboxField}>
          <input
            checked={enabled}
            type="checkbox"
            onChange={(event) => {
              setEnabled(event.target.checked);
            }}
          />
          <span>포인터 이벤트 활성화</span>
        </label>
      </CommonExampleControlPanel>

      <CommonExampleStagePanel className={reactMotionPointerContainerCss.stage}>
        <div
          {...withPointerMove}
          className={reactMotionPointerContainerCss.dragBox}
          style={{
            ...withPointerMove.style,
            transform: `translate3d(${currentPoint.x}px, ${currentPoint.y}px, 0)`,
          }}>
          Drag
        </div>
      </CommonExampleStagePanel>

      <CommonExampleStatePanel
        items={[
          { label: "x", value: Math.round(currentPoint.x) },
          { label: "y", value: Math.round(currentPoint.y) },
          { label: "distance", value: distance },
          { label: "드래그 중", value: isDragging ? "true" : "false" },
        ]}
      />
    </CommonContainer>
  );
};

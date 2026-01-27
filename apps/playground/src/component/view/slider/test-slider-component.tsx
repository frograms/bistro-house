import "@watcha-authentic/react-slider/resource/css/common/slider.css";

import {
  Slider,
  type SliderRef,
} from "@watcha-authentic/react-slider/component/view/slider";
import { useRef, useState } from "react";

// const items = ["red", "green", "blue", "yellow", "purple"];
const items = ["red", "green"];

export const TestSliderComponent = () => {
  const slider = useRef<SliderRef>(null);

  const [currentIndex, setCurrentIndex] = useState(1);

  return (
    <>
      <button onClick={() => slider.current?.doPrev()}>Slider Prev</button>
      <button onClick={() => slider.current?.doNext()}>Slider Next</button>
      <p>page: {currentIndex}</p>
      <Slider
        ref={slider}
        animationDuration={1000}
        defaultIndex={currentIndex}
        items={items}
        wrapProps={{ style: {} }}
        onCreateItemView={(item) => (
          <div style={{ padding: 40, backgroundColor: item }}>Item {item}</div>
        )}
        onIndexChange={(index) => {
          setCurrentIndex(index);
        }}
        onItemKey={() => "item"}
      />
    </>
  );
};

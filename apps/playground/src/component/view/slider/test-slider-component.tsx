import "@watcha-authentic/react-slider/resource/css/common/slider.css";

import {
  Slider,
  type SliderRef,
} from "@watcha-authentic/react-slider/component/view/slider";
import { useRef, useState } from "react";

const items: Array<{
  backgroundColor: string;
  imageUrl: string;
}> = [
  {
    backgroundColor: "yellow",
    imageUrl: `https://dummyimage.com/600x400/000/fff&text=1`,
  },
  {
    backgroundColor: "green",
    imageUrl: `https://dummyimage.com/600x400/000/fff&text=2`,
  },
  {
    backgroundColor: "blue",
    imageUrl: `https://dummyimage.com/600x400/000/fff&text=3`,
  },
  {
    backgroundColor: "indigo",
    imageUrl: `https://dummyimage.com/600x400/000/fff&text=4`,
  },
  {
    backgroundColor: "purple",
    imageUrl: `https://dummyimage.com/600x400/000/fff&text=5`,
  },
];

export const TestSliderComponent = () => {
  const slider = useRef<SliderRef>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <>
      <button onClick={() => slider.current?.doPrev()}>Slider Prev</button>
      <button onClick={() => slider.current?.doNext()}>Slider Next</button>
      <p>page: {currentIndex}</p>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          background: "red",
        }}>
        <div
          style={{
            width: 500,
            overflow: "hidden",
            background: "orange",
            padding: 16,
          }}>
          <Slider
            ref={slider}
            animationDuration={1000}
            defaultIndex={currentIndex}
            items={items}
            wrapProps={{ style: {} }}
            onCreateItemView={(item) => (
              // <div style={{ backgroundColor: item.backgroundColor }}>
              //   Item {item.backgroundColor}
              // </div>
              <img
                alt={item.backgroundColor}
                src={item.imageUrl}
                style={{ width: "100%" }}
              />
            )}
            onIndexChange={(index, cause) => {
              // TODO drag 에서 swipe 로 cause 값이 전달되는 이슈 수정
              console.info("onIndexChange", index, cause);
              setCurrentIndex(index);
            }}
            onItemKey={() => "item"}
          />
        </div>
      </div>
    </>
  );
};

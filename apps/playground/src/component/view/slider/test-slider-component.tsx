import "@watcha-authentic/react-slider/resource/css/common/slider.css";

import { Slider } from "@watcha-authentic/react-slider/component/view/slider";

const colors = ["red", "green", "blue", "yellow", "purple"];

export const TestSliderComponent = () => {
  return (
    <Slider
      items={[1, 2, 3, 4, 5]}
      wrapProps={{ style: { overflow: "hidden" } }}
      onCreateItemView={(item) => (
        <div style={{ padding: 40, backgroundColor: colors[item - 1] }}>
          Item {item}
        </div>
      )}
      onItemKey={() => "item"}
    />
  );
};

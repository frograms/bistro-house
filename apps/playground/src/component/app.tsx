import "../resource/css/common/app.css";

import { TestSliderComponent } from "./view/slider/test-slider-component";

export const App = () => {
  return (
    <main>
      <h1>Bistro House - playground</h1>
      <section>
        <h2>Slider</h2>
        <TestSliderComponent />
      </section>
    </main>
  );
};

import "../resource/style/app.css";

import { useState } from "react";

import heroImg from "../resource/image/hero.png";
import iconsSprite from "../resource/image/icons.svg";
import reactLogo from "../resource/image/react.svg";
import viteLogo from "../resource/image/vite.svg";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img alt="" className="base" height="179" src={heroImg} width="170" />
          <img alt="React logo" className="framework" src={reactLogo} />
          <img alt="Vite logo" className="vite" src={viteLogo} />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/component/app.tsx</code> and save to test{" "}
            <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          type="button"
          onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </section>

      <div className="ticks" />

      <section id="next-steps">
        <div id="docs">
          <svg aria-hidden="true" className="icon" role="presentation">
            <use href={`${iconsSprite}#documentation-icon`} />
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" rel="noreferrer" target="_blank">
                <img alt="" className="logo" src={viteLogo} />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" rel="noreferrer" target="_blank">
                <img alt="" className="button-icon" src={reactLogo} />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg aria-hidden="true" className="icon" role="presentation">
            <use href={`${iconsSprite}#social-icon`} />
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a
                href="https://github.com/vitejs/vite"
                rel="noreferrer"
                target="_blank">
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation">
                  <use href={`${iconsSprite}#github-icon`} />
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" rel="noreferrer" target="_blank">
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation">
                  <use href={`${iconsSprite}#discord-icon`} />
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" rel="noreferrer" target="_blank">
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation">
                  <use href={`${iconsSprite}#x-icon`} />
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a
                href="https://bsky.app/profile/vite.dev"
                rel="noreferrer"
                target="_blank">
                <svg
                  aria-hidden="true"
                  className="button-icon"
                  role="presentation">
                  <use href={`${iconsSprite}#bluesky-icon`} />
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks" />
      <section id="spacer" />
    </>
  );
};

export default App;

import type { ReactNode } from "react";

import { commonNoteCss } from "./common-note.css";

type CommonNoteProps = {
  items: Array<ReactNode>;
};

export const CommonNote = ({ items }: CommonNoteProps) => {
  return (
    <div className={commonNoteCss.group}>
      {items.map((item, index) => (
        <p key={index} className={commonNoteCss.wrap}>
          {item}
        </p>
      ))}
    </div>
  );
};

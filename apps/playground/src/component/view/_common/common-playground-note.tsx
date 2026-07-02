import type { ReactNode } from "react";

import { commonPlaygroundNoteCss } from "./common-playground-note.css";

type CommonPlaygroundNoteProps = {
  items: Array<ReactNode>;
};

export const CommonPlaygroundNote = ({ items }: CommonPlaygroundNoteProps) => {
  return (
    <div className={commonPlaygroundNoteCss.group}>
      {items.map((item, index) => (
        <p key={index} className={commonPlaygroundNoteCss.wrap}>
          {item}
        </p>
      ))}
    </div>
  );
};

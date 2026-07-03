import { commonNoteCss } from "@playground/component/view/_common/common-note.css";
import type { ReactNode } from "react";

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

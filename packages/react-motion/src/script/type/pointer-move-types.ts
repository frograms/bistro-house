import type { PointerEventHandler } from "react";

import type { Point2D } from "./primitives";

export type PointerEventType = "end" | "move" | "start";

export type TransactionType = PointerEventType | "pending";

export type Calculate = { diff: Point2D; distance: number };

export type Pointer = { [key in PointerEventType]: Point2D | undefined } & {
  calculate?: Calculate;
  isPrimary: boolean;
};

export type PointerTransaction = {
  pointers: Map<number, Pointer>;
  primaryPointer: Pointer | undefined;
  triggerBy: EventTarget | null;
  type: TransactionType;
};

export type PointerEvents<ElementType = HTMLElement> = {
  onPointerCancel: PointerEventHandler<ElementType>;
  onPointerDown: PointerEventHandler<ElementType>;
  onPointerLeave: PointerEventHandler<ElementType>;
  onPointerMove: PointerEventHandler<ElementType>;
  onPointerUp: PointerEventHandler<ElementType>;
};

export type NativePointerEventHandler = (event: PointerEvent) => void;

export type NativePointerEventHandlers = {
  handlePointerCancel: NativePointerEventHandler;
  handlePointerDown: NativePointerEventHandler;
  handlePointerLeave: NativePointerEventHandler;
  handlePointerMove: NativePointerEventHandler;
  handlePointerUp: NativePointerEventHandler;
};

export type PointerMoveData = {
  event: PointerEvent;
  isCancel: boolean;
  isEnd: boolean;
  transaction: PointerTransaction;
};

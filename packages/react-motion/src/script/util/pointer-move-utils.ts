import type { Pointer, PointerTransaction } from "../type/pointer-move-types";

export const initializePointerTransaction = (): PointerTransaction => ({
  pointers: new Map(),
  primaryPointer: {
    calculate: { diff: { x: 0, y: 0 }, distance: 0 },
    end: undefined,
    isPrimary: true,
    move: undefined,
    start: undefined,
  },
  triggerBy: null,
  type: "pending",
});

export const defaultPointerTransaction: PointerTransaction =
  initializePointerTransaction();

export const clonePointer = (pointer: Pointer): Pointer => ({
  calculate: pointer.calculate && {
    diff: pointer.calculate.diff,
    distance: pointer.calculate.distance,
  },
  end: pointer.end && {
    x: pointer.end.x,
    y: pointer.end.y,
  },
  isPrimary: pointer.isPrimary,
  move: pointer.move && {
    x: pointer.move.x,
    y: pointer.move.y,
  },
  start: pointer.start && {
    x: pointer.start.x,
    y: pointer.start.y,
  },
});

/**
 * 참조를 제거 합니다.
 */
export const clonePointerTransaction = ({
  pointers,
  primaryPointer,
  triggerBy,
  type,
}: PointerTransaction): PointerTransaction => {
  return {
    pointers: new Map<number, Pointer>(
      Array.from(pointers, ([key, value]) => [key, clonePointer(value)])
    ),
    primaryPointer: primaryPointer ? clonePointer(primaryPointer) : undefined,
    triggerBy,
    type,
  };
};

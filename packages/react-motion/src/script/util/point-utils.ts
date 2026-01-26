import type { Point2D } from "../type/primitives";

export const getDistance = (p1: Point2D, p2: Point2D) => {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
};

export const addPoint = (p1: Point2D, p2: Point2D): Point2D => ({
  x: p1.x + p2.x,
  y: p1.y + p2.y,
});

export const subtractPoint = (p1: Point2D, p2: Point2D): Point2D => ({
  x: p1.x - p2.x,
  y: p1.y - p2.y,
});

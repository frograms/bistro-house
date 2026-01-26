export const linearInterpolation = (
  start: number,
  end: number,
  ratio: number
) => {
  return (1 - ratio) * start + ratio * end;
};

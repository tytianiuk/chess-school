export const getPuzzlesCountText = (count: number): string => {
  if (count === 1) return 'задача';
  if (count >= 2 && count <= 4) return 'задачі';
  return 'задач';
};

export const getMoveCountText = (count: number): string => {
  if (count === 1) return 'хід';
  if (count >= 2 && count <= 4) return 'ходи';
  return 'ходів';
};

const computeDeltaPct = (value: number, prev: number): number | null => {
  if (prev === 0) return value === 0 ? 0 : null;
  return Math.round(((value - prev) / prev) * 1000) / 10;
};

export default computeDeltaPct;

import { describe, it, expect } from 'vitest';
import computeDeltaPct from '@/lib/stats/computeDeltaPct';

describe('computeDeltaPct', () => {
  it('returns percent change rounded to one decimal', () => {
    expect(computeDeltaPct(54, 46)).toBe(17.4);
  });

  it('returns 0 when both values are 0', () => {
    expect(computeDeltaPct(0, 0)).toBe(0);
  });

  it('returns null when previous is 0 and current is positive', () => {
    expect(computeDeltaPct(3, 0)).toBeNull();
  });

  it('returns negative percent for decreases', () => {
    expect(computeDeltaPct(21, 23)).toBe(-8.7);
  });
});

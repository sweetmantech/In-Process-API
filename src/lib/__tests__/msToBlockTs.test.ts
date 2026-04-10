import { describe, it, expect } from 'vitest';
import msToBlockTs from '../msToBlockTs';

describe('msToBlockTs', () => {
  it('converts milliseconds to seconds by flooring', () => {
    expect(msToBlockTs(1000)).toBe(1);
    expect(msToBlockTs(1500)).toBe(1);
    expect(msToBlockTs(1999)).toBe(1);
    expect(msToBlockTs(2000)).toBe(2);
  });

  it('returns 0 for null', () => {
    expect(msToBlockTs(null)).toBe(0);
  });

  it('returns 0 for 0', () => {
    expect(msToBlockTs(0)).toBe(0);
  });

  it('handles large timestamps', () => {
    expect(msToBlockTs(1700000000000)).toBe(1700000000);
  });
});

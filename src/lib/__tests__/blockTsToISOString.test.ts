import { describe, it, expect } from 'vitest';
import blockTsToISOString from '../blockTsToISOString';

describe('blockTsToISOString', () => {
  it('converts a block timestamp (seconds) to ISO string', () => {
    expect(blockTsToISOString(0)).toBe('1970-01-01T00:00:00.000Z');
  });

  it('converts a known timestamp correctly', () => {
    // 1700000000 seconds = 2023-11-14T22:13:20.000Z
    expect(blockTsToISOString(1700000000)).toBe('2023-11-14T22:13:20.000Z');
  });

  it('multiplies seconds by 1000 before constructing Date', () => {
    const ts = 1000;
    expect(blockTsToISOString(ts)).toBe(new Date(ts * 1000).toISOString());
  });
});

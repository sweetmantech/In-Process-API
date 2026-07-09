import { describe, it, expect } from 'vitest';
import parseExifOffsetMs from '../parseExifOffsetMs';

describe('parseExifOffsetMs', () => {
  it('parses a positive offset', () => {
    expect(parseExifOffsetMs('+09:00')).toBe(9 * 60 * 60_000);
  });

  it('parses a negative offset', () => {
    expect(parseExifOffsetMs('-05:00')).toBe(-5 * 60 * 60_000);
  });

  it('parses a non-zero minutes offset', () => {
    expect(parseExifOffsetMs('+05:30')).toBe((5 * 60 + 30) * 60_000);
  });

  it('returns undefined for undefined input', () => {
    expect(parseExifOffsetMs(undefined)).toBeUndefined();
  });

  it('returns undefined for a malformed string', () => {
    expect(parseExifOffsetMs('not-an-offset')).toBeUndefined();
  });

  it('returns undefined for a non-string value', () => {
    expect(parseExifOffsetMs(540)).toBeUndefined();
  });
});

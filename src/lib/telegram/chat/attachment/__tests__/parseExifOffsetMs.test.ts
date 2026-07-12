import { describe, it, expect } from 'vitest';
import parseExifOffsetMs from '@/lib/telegram/chat/attachment/parseExifOffsetMs';

describe('parseExifOffsetMs', () => {
  it('parses a positive offset', () => {
    expect(parseExifOffsetMs('+09:00')).toBe(9 * 60 * 60_000);
  });

  it('parses a negative offset', () => {
    expect(parseExifOffsetMs('-05:00')).toBe(-5 * 60 * 60_000);
  });

  it('parses a half-hour offset', () => {
    expect(parseExifOffsetMs('+05:30')).toBe((5 * 60 + 30) * 60_000);
  });

  it('returns undefined for missing values', () => {
    expect(parseExifOffsetMs(undefined)).toBeUndefined();
  });

  it('returns undefined for malformed strings', () => {
    expect(parseExifOffsetMs('not-an-offset')).toBeUndefined();
  });

  it('returns undefined for non-string types', () => {
    expect(parseExifOffsetMs(540)).toBeUndefined();
  });
});

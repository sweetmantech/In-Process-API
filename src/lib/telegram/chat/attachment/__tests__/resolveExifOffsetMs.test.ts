import { describe, it, expect } from 'vitest';
import resolveExifOffsetMs from '@/lib/telegram/chat/attachment/resolveExifOffsetMs';

describe('resolveExifOffsetMs', () => {
  it('prefers OffsetTimeOriginal over OffsetTime', () => {
    expect(
      resolveExifOffsetMs({
        OffsetTimeOriginal: '+09:00',
        OffsetTime: '+01:00',
      })
    ).toBe(9 * 60 * 60_000);
  });

  it('falls back to OffsetTime when OffsetTimeOriginal is absent', () => {
    expect(resolveExifOffsetMs({ OffsetTime: '+01:00' })).toBe(60 * 60_000);
  });

  it('returns undefined when both offset tags are absent', () => {
    expect(resolveExifOffsetMs({})).toBeUndefined();
  });
});

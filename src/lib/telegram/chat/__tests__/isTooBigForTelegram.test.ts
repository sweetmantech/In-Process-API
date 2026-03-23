import { describe, it, expect } from 'vitest';
import isTooBigForTelegram, { TOO_BIG_MESSAGE } from '../isTooBigForTelegram';

const TWENTY_MB = 20 * 1024 * 1024;

describe('isTooBigForTelegram', () => {
  it('returns false when size is undefined', () => {
    expect(isTooBigForTelegram({ type: 'image' } as never)).toBe(false);
  });

  it('returns false when size is 0', () => {
    expect(isTooBigForTelegram({ type: 'image', size: 0 } as never)).toBe(
      false
    );
  });

  it('returns false when size equals exactly 20MB', () => {
    expect(
      isTooBigForTelegram({ type: 'image', size: TWENTY_MB } as never)
    ).toBe(false);
  });

  it('returns false when size is just under 20MB', () => {
    expect(
      isTooBigForTelegram({ type: 'image', size: TWENTY_MB - 1 } as never)
    ).toBe(false);
  });

  it('returns true when size exceeds 20MB', () => {
    expect(
      isTooBigForTelegram({ type: 'image', size: TWENTY_MB + 1 } as never)
    ).toBe(true);
  });

  it('returns true for a large video', () => {
    expect(
      isTooBigForTelegram({ type: 'video', size: 100 * 1024 * 1024 } as never)
    ).toBe(true);
  });
});

describe('TOO_BIG_MESSAGE', () => {
  it('mentions the 20MB limit', () => {
    expect(TOO_BIG_MESSAGE).toContain('20MB');
  });

  it('includes the upload URL', () => {
    expect(TOO_BIG_MESSAGE).toContain('inprocess.world/create');
  });
});

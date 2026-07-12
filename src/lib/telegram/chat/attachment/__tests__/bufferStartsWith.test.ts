import { describe, it, expect } from 'vitest';
import bufferStartsWith from '@/lib/telegram/chat/attachment/bufferStartsWith';

describe('bufferStartsWith', () => {
  it('returns true when the buffer starts with the magic bytes', () => {
    expect(
      bufferStartsWith(
        Buffer.from([0xff, 0xd8, 0xff, 0x00]),
        [0xff, 0xd8, 0xff]
      )
    ).toBe(true);
  });

  it('returns false when the prefix does not match', () => {
    expect(
      bufferStartsWith(Buffer.from([0x00, 0xd8, 0xff]), [0xff, 0xd8, 0xff])
    ).toBe(false);
  });
});

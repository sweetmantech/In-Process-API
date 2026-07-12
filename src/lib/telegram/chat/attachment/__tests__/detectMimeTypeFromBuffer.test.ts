import { describe, it, expect } from 'vitest';
import detectMimeTypeFromBuffer from '@/lib/telegram/chat/attachment/detectMimeTypeFromBuffer';

describe('detectMimeTypeFromBuffer', () => {
  it('returns undefined for unknown bytes', () => {
    expect(
      detectMimeTypeFromBuffer(Buffer.from('not-an-image'))
    ).toBeUndefined();
  });
});

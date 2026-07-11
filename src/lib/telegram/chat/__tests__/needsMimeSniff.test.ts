import { describe, it, expect } from 'vitest';
import needsMimeSniff from '../needsMimeSniff';

describe('needsMimeSniff', () => {
  it('returns true for file attachments without a useful mimeType', () => {
    expect(needsMimeSniff({ type: 'file' } as never)).toBe(true);
    expect(
      needsMimeSniff({
        type: 'file',
        mimeType: 'application/octet-stream',
      } as never)
    ).toBe(true);
  });

  it('returns false when the mimeType is already known', () => {
    expect(
      needsMimeSniff({ type: 'file', mimeType: 'image/jpeg' } as never)
    ).toBe(false);
  });
});

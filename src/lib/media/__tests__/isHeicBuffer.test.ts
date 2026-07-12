import { describe, it, expect } from 'vitest';
import isHeicBuffer from '../isHeicBuffer';

describe('isHeicBuffer', () => {
  it('returns false for non-HEIC bytes', () => {
    expect(isHeicBuffer(Buffer.from('not-an-image'))).toBe(false);
  });
});

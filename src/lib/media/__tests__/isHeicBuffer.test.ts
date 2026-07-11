import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import isHeicBuffer from '../isHeicBuffer';

const readHeicFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, '../../telegram/chat/__tests__/fixtures', name));

describe('isHeicBuffer', () => {
  it('returns true for Apple multi-brand HEIC', () => {
    expect(isHeicBuffer(readHeicFixture('apple-styled-photo.heic'))).toBe(true);
  });

  it('returns true for the shelf HEIC fixture', () => {
    expect(
      isHeicBuffer(readHeicFixture('shelf-christmas-decoration.heic'))
    ).toBe(true);
  });

  it('returns false for non-HEIC bytes', () => {
    expect(isHeicBuffer(Buffer.from('not-an-image'))).toBe(false);
  });
});

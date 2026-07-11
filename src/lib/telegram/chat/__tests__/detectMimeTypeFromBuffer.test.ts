import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import detectMimeTypeFromBuffer from '../detectMimeTypeFromBuffer';

const readFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, 'fixtures', name));

describe('detectMimeTypeFromBuffer', () => {
  it('detects HEIC from magic bytes when the file path has no extension', () => {
    const buffer = readFixture('apple-styled-photo.heic');
    expect(detectMimeTypeFromBuffer(buffer)).toBe('image/heic');
  });

  it('detects HEIC for the shelf fixture', () => {
    const buffer = readFixture('shelf-christmas-decoration.heic');
    expect(detectMimeTypeFromBuffer(buffer)).toBe('image/heic');
  });

  it('returns undefined for unknown bytes', () => {
    expect(
      detectMimeTypeFromBuffer(Buffer.from('not-an-image'))
    ).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import resolveTelegramFileMimeType from '../resolveTelegramFileMimeType';

const readFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, 'fixtures', name));

describe('resolveTelegramFileMimeType', () => {
  it('prefers the file path extension when present', () => {
    const buffer = readFixture('shelf-christmas-decoration.heic');
    expect(resolveTelegramFileMimeType('photos/file.jpg', buffer)).toBe(
      'image/jpeg'
    );
  });

  it('sniffs HEIC from magic bytes when the Telegram path has no extension', () => {
    const buffer = readFixture('apple-styled-photo.heic');
    expect(resolveTelegramFileMimeType('documents/111', buffer)).toBe(
      'image/heic'
    );
  });
});

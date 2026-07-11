import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import extractExifCaptureDate from '../extractExifCaptureDate';

const readFixture = (name: string): Buffer =>
  readFileSync(join(__dirname, 'fixtures', name));

describe('extractExifCaptureDate HEIC integration', () => {
  it('extracts the correct UTC instant from the shelf HEIC fixture', async () => {
    const result = await extractExifCaptureDate(
      readFixture('shelf-christmas-decoration.heic')
    );

    expect(result).toBe(
      Math.floor(new Date('2023-12-13T12:03:39.000Z').getTime() / 1000)
    );
  });

  it('extracts the correct UTC instant from an Apple multi-brand HEIC fixture', async () => {
    const result = await extractExifCaptureDate(
      readFixture('apple-styled-photo.heic')
    );

    expect(result).toBe(
      Math.floor(new Date('2026-07-05T16:02:17.000Z').getTime() / 1000)
    );
  });
});

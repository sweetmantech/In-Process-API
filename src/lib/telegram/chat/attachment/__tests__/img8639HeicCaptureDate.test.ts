import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import extractExifCaptureDate from '@/lib/telegram/chat/attachment/extractExifCaptureDate';
import readFtypBrands from '@/lib/media/readFtypBrands';

/**
 * Local AirDrop original from issue #1474. Skipped in CI when absent.
 * This file's Exif item is Orientation + Apple MakerNote only — no
 * DateTimeOriginal / OffsetTime* — so capture-date extraction must stay
 * undefined (no timezone guessing).
 */
const FIXTURE_PATH = path.join(
  process.env.HOME ?? '',
  'Downloads',
  'IMG_8639.HEIC'
);

describe('IMG_8639.HEIC (issue #1474 AirDrop original)', () => {
  const present = fs.existsSync(FIXTURE_PATH);

  it.skipIf(!present)('has heic major brand and is readable as HEIC', () => {
    const buf = fs.readFileSync(FIXTURE_PATH);
    expect(readFtypBrands(buf)[0]).toBe('heic');
    expect(readFtypBrands(buf)).toContain('mif1');
  });

  it.skipIf(!present)(
    'returns undefined capture date because offset/datetime EXIF is absent',
    async () => {
      const buf = fs.readFileSync(FIXTURE_PATH);
      await expect(extractExifCaptureDate(buf)).resolves.toBeUndefined();
    }
  );
});

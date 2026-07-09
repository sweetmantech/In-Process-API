import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('exifr', () => ({
  default: { parse: vi.fn() },
}));

import exifr from 'exifr';
import extractExifCaptureDate from '../extractExifCaptureDate';

const mockParse = vi.mocked(exifr.parse);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('extractExifCaptureDate', () => {
  it('requests raw (non-revived) values including OffsetTimeOriginal', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: '+09:00',
    });

    await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(mockParse).toHaveBeenCalledWith(expect.any(Buffer), {
      pick: ['DateTimeOriginal', 'OffsetTimeOriginal'],
      reviveValues: false,
    });
  });

  it('computes the true UTC instant when OffsetTimeOriginal is present', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: '+09:00',
    });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBe(
      (Date.UTC(2026, 6, 9, 23, 32, 10) - 9 * 60 * 60_000) / 1000
    );
  });

  it('subtracts a negative OffsetTimeOriginal correctly', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: '-05:00',
    });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBe(
      (Date.UTC(2026, 6, 9, 23, 32, 10) + 5 * 60 * 60_000) / 1000
    );
  });

  it('skips EXIF entirely when OffsetTimeOriginal is absent, even if DateTimeOriginal is present', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: '2026:07:09 23:32:10' });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBeUndefined();
  });

  it('skips EXIF when OffsetTimeOriginal is present but malformed', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: 'garbage',
    });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when there is no EXIF data at all', async () => {
    mockParse.mockResolvedValue(undefined);

    const result = await extractExifCaptureDate(Buffer.from('no-exif'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when DateTimeOriginal is not a string, even with a valid offset', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: 12345,
      OffsetTimeOriginal: '+09:00',
    });

    const result = await extractExifCaptureDate(Buffer.from('weird-exif'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when DateTimeOriginal does not match the expected format, even with a valid offset', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: 'not-a-date',
      OffsetTimeOriginal: '+09:00',
    });

    const result = await extractExifCaptureDate(Buffer.from('malformed'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when exifr throws (e.g. unsupported format)', async () => {
    mockParse.mockRejectedValue(new Error('Unknown file format'));

    const result = await extractExifCaptureDate(Buffer.from('image.webp'));

    expect(result).toBeUndefined();
  });
});

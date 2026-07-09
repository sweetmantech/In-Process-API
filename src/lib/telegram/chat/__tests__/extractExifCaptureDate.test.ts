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
  it('parses a raw EXIF DateTimeOriginal string as UTC', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: '2026:07:09 23:32:10' });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBe(Date.UTC(2026, 6, 9, 23, 32, 10) / 1000);
  });

  it('requests raw (non-revived) values so the result is TZ-independent', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: '2026:07:09 23:32:10' });

    await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(mockParse).toHaveBeenCalledWith(expect.any(Buffer), {
      pick: ['DateTimeOriginal', 'OffsetTimeOriginal'],
      reviveValues: false,
    });
  });

  it('uses OffsetTimeOriginal to compute the true UTC instant when present', async () => {
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

  it('falls back to treating the wall-clock as UTC when OffsetTimeOriginal is malformed', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: 'garbage',
    });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBe(Date.UTC(2026, 6, 9, 23, 32, 10) / 1000);
  });

  it('returns undefined when there is no DateTimeOriginal tag', async () => {
    mockParse.mockResolvedValue(undefined);

    const result = await extractExifCaptureDate(Buffer.from('no-exif'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when DateTimeOriginal is not a string', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: 12345 });

    const result = await extractExifCaptureDate(Buffer.from('weird-exif'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when DateTimeOriginal does not match the expected format', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: 'not-a-date' });

    const result = await extractExifCaptureDate(Buffer.from('malformed'));

    expect(result).toBeUndefined();
  });

  it('returns undefined when exifr throws (e.g. unsupported format)', async () => {
    mockParse.mockRejectedValue(new Error('Unknown file format'));

    const result = await extractExifCaptureDate(Buffer.from('image.webp'));

    expect(result).toBeUndefined();
  });
});

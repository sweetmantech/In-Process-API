import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('exifr', () => ({
  default: { parse: vi.fn() },
}));

import exifr from 'exifr';
import extractExifCaptureDate from '@/lib/telegram/chat/attachment/extractExifCaptureDate';

const mockParse = vi.mocked(exifr.parse);

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('extractExifCaptureDate', () => {
  it('requests raw (non-revived) values including offset tags', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: '+09:00',
    });

    await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(mockParse).toHaveBeenCalledWith(expect.any(Buffer), {
      pick: ['DateTimeOriginal', 'OffsetTimeOriginal', 'OffsetTime'],
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

  it('falls back to OffsetTime when OffsetTimeOriginal is absent', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2023:12:13 13:03:39',
      OffsetTime: '+01:00',
    });

    const result = await extractExifCaptureDate(Buffer.from('heic-bytes'));

    expect(result).toBe(
      (Date.UTC(2023, 11, 13, 13, 3, 39) - 60 * 60_000) / 1000
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

  it('skips EXIF entirely when no offset tag is present, even if DateTimeOriginal is present', async () => {
    mockParse.mockResolvedValue({ DateTimeOriginal: '2026:07:09 23:32:10' });

    const result = await extractExifCaptureDate(Buffer.from('jpeg-bytes'));

    expect(result).toBeUndefined();
    expect(console.warn).toHaveBeenCalledWith(
      '[extractExifCaptureDate] falling back to upload time',
      expect.objectContaining({ reason: 'missing_offset' })
    );
  });

  it('skips EXIF when offset tags are present but malformed', async () => {
    mockParse.mockResolvedValue({
      DateTimeOriginal: '2026:07:09 23:32:10',
      OffsetTimeOriginal: 'garbage',
      OffsetTime: 'also-garbage',
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
    expect(console.warn).toHaveBeenCalledWith(
      '[extractExifCaptureDate] falling back to upload time',
      expect.objectContaining({ reason: 'parse_threw' })
    );
  });
});

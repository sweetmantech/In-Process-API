import exifr from 'exifr';
import parseExifOffsetMs from './parseExifOffsetMs';

const EXIF_DATE_PATTERN = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

const extractExifCaptureDate = async (
  buffer: Buffer
): Promise<number | undefined> => {
  try {
    const result = await exifr.parse(buffer, {
      pick: ['DateTimeOriginal', 'OffsetTimeOriginal'],
      reviveValues: false,
    });

    // DateTimeOriginal alone carries no timezone, and saleStart is written
    // on-chain — so without a real OffsetTimeOriginal (EXIF 2.31+) to compute
    // the true UTC instant, we don't guess. Skip EXIF entirely and let the
    // caller fall back to upload time.
    const offsetMs = parseExifOffsetMs(result?.OffsetTimeOriginal);
    if (offsetMs === undefined) return undefined;

    const raw = result?.DateTimeOriginal;
    if (typeof raw !== 'string') return undefined;

    const match = EXIF_DATE_PATTERN.exec(raw);
    if (!match) return undefined;
    const [, year, month, day, hour, minute, second] = match;

    const localAsUtcMs = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );

    return Math.floor((localAsUtcMs - offsetMs) / 1000);
  } catch {
    return undefined;
  }
};

export default extractExifCaptureDate;

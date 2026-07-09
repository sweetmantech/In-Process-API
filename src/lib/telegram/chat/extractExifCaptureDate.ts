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

    // DateTimeOriginal alone carries no timezone. When the camera also wrote
    // OffsetTimeOriginal (EXIF 2.31+), use it to compute the true UTC instant;
    // otherwise fall back to treating the wall-clock value as UTC so the
    // result stays deterministic regardless of the host's runtime TZ.
    const offsetMs = parseExifOffsetMs(result?.OffsetTimeOriginal);
    const epochMs =
      offsetMs === undefined ? localAsUtcMs : localAsUtcMs - offsetMs;

    return Math.floor(epochMs / 1000);
  } catch {
    return undefined;
  }
};

export default extractExifCaptureDate;

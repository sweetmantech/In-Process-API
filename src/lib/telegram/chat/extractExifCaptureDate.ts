import exifr from 'exifr';

const EXIF_DATE_PATTERN = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

const extractExifCaptureDate = async (
  buffer: Buffer
): Promise<number | undefined> => {
  try {
    const result = await exifr.parse(buffer, {
      pick: ['DateTimeOriginal'],
      reviveValues: false,
    });
    const raw = result?.DateTimeOriginal;
    if (typeof raw !== 'string') return undefined;

    const match = EXIF_DATE_PATTERN.exec(raw);
    if (!match) return undefined;
    const [, year, month, day, hour, minute, second] = match;

    // EXIF DateTimeOriginal carries no timezone; treat the wall-clock value as
    // UTC so the result stays deterministic regardless of the host's runtime TZ.
    const epochMs = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return Math.floor(epochMs / 1000);
  } catch {
    return undefined;
  }
};

export default extractExifCaptureDate;

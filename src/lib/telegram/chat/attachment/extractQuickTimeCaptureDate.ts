import readQuickTimeCreationDate from '@/lib/media/readQuickTimeCreationDate';

const QUICKTIME_CREATIONDATE_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|[+-]\d{2}:?\d{2})$/;

/**
 * iPhone/QuickTime videos embed `com.apple.quicktime.creationdate` as ISO
 * 8601 with the UTC offset baked in (e.g. "...T12:30:03-0400") — unlike
 * photo EXIF, there's no separate offset tag to look up. Same on-chain
 * saleStart caution as extractExifCaptureDate applies: if the value is
 * missing or doesn't parse, skip it entirely and let the caller fall back
 * to upload time.
 */
const extractQuickTimeCaptureDate = (buffer: Buffer): number | undefined => {
  try {
    const raw = readQuickTimeCreationDate(buffer);
    if (typeof raw !== 'string') return undefined;

    const match = QUICKTIME_CREATIONDATE_PATTERN.exec(raw);
    if (!match) return undefined;
    const [, year, month, day, hour, minute, second, offset] = match;

    const localAsUtcMs = Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );

    const offsetMs =
      offset === 'Z'
        ? 0
        : (offset.startsWith('-') ? -1 : 1) *
          (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(-2))) *
          60_000;

    return Math.floor((localAsUtcMs - offsetMs) / 1000);
  } catch {
    return undefined;
  }
};

export default extractQuickTimeCaptureDate;

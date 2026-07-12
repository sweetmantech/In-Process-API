import parseExifOffsetMs from './parseExifOffsetMs';

type ExifOffsetFields = {
  OffsetTimeOriginal?: unknown;
  OffsetTime?: unknown;
};

/**
 * Resolves the capture-time offset from EXIF fields.
 * OffsetTimeOriginal is preferred; OffsetTime is the HEIC/JPEG fallback
 * when only the generic offset tag is present.
 */
const resolveExifOffsetMs = (
  fields: ExifOffsetFields | undefined
): number | undefined =>
  parseExifOffsetMs(fields?.OffsetTimeOriginal) ??
  parseExifOffsetMs(fields?.OffsetTime);

export default resolveExifOffsetMs;

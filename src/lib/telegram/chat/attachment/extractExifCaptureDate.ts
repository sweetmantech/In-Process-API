import exifr from 'exifr';
import patchExifrHeicDetection from './patchExifrHeicDetection';
import resolveExifOffsetMs from './resolveExifOffsetMs';
import readFtypBrands from '@/lib/media/readFtypBrands';

patchExifrHeicDetection();

const EXIF_DATE_PATTERN = /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;

type ExifCaptureFallbackReason =
  | 'parse_threw'
  | 'missing_offset'
  | 'missing_datetime'
  | 'malformed_datetime';

const logExifCaptureFallback = (
  reason: ExifCaptureFallbackReason,
  buffer: Buffer,
  detail?: string
): void => {
  const brands = readFtypBrands(buffer);
  console.warn('[extractExifCaptureDate] falling back to upload time', {
    reason,
    detail,
    byteLength: buffer.length,
    ftypBrands: brands,
  });
};

const extractExifCaptureDate = async (
  buffer: Buffer
): Promise<number | undefined> => {
  try {
    const result = await exifr.parse(buffer, {
      pick: ['DateTimeOriginal', 'OffsetTimeOriginal', 'OffsetTime'],
      reviveValues: false,
    });

    // DateTimeOriginal alone carries no timezone, and saleStart is written
    // on-chain — so without OffsetTimeOriginal or OffsetTime (EXIF 2.31+) to
    // compute the true UTC instant, we don't guess. Skip EXIF entirely and
    // let the caller fall back to upload time.
    const offsetMs = resolveExifOffsetMs(result);
    if (offsetMs === undefined) {
      logExifCaptureFallback(
        'missing_offset',
        buffer,
        result?.DateTimeOriginal ? 'DateTimeOriginal present' : 'no DateTimeOriginal'
      );
      return undefined;
    }

    const raw = result?.DateTimeOriginal;
    if (typeof raw !== 'string') {
      logExifCaptureFallback('missing_datetime', buffer);
      return undefined;
    }

    const match = EXIF_DATE_PATTERN.exec(raw);
    if (!match) {
      logExifCaptureFallback('malformed_datetime', buffer, raw);
      return undefined;
    }
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
  } catch (error) {
    logExifCaptureFallback(
      'parse_threw',
      buffer,
      error instanceof Error ? error.message : String(error)
    );
    return undefined;
  }
};

export default extractExifCaptureDate;

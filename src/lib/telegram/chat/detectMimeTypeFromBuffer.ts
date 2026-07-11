import bufferStartsWith from './bufferStartsWith';
import readFtypBrands from './readFtypBrands';

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const GIF87_MAGIC = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61];
const GIF89_MAGIC = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61];
const RIFF_MAGIC = [0x52, 0x49, 0x46, 0x46];
const WEBP_MAGIC = [0x57, 0x45, 0x42, 0x50];

const FTYP_IMAGE_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'mif1']);
const FTYP_HEIF_BRANDS = new Set([
  'heif',
  'hevc',
  'hevx',
  'hevm',
  'hevs',
  'msf1',
]);
const FTYP_VIDEO_BRANDS = new Set([
  'mp41',
  'mp42',
  'isom',
  'iso2',
  'avc1',
  'qt  ',
  'M4V ',
  'M4A ',
  'f4v ',
  'dash',
]);

/**
 * Sniffs image/video MIME from magic bytes when the Telegram file path
 * has no useful extension (e.g. a document named "111").
 */
const detectMimeTypeFromBuffer = (buffer: Buffer): string | undefined => {
  if (buffer.length < 12) return undefined;

  if (bufferStartsWith(buffer, JPEG_MAGIC)) return 'image/jpeg';
  if (bufferStartsWith(buffer, PNG_MAGIC)) return 'image/png';
  if (
    bufferStartsWith(buffer, GIF87_MAGIC) ||
    bufferStartsWith(buffer, GIF89_MAGIC)
  ) {
    return 'image/gif';
  }
  if (
    bufferStartsWith(buffer, RIFF_MAGIC) &&
    bufferStartsWith(buffer.subarray(8), WEBP_MAGIC)
  ) {
    return 'image/webp';
  }

  const brands = readFtypBrands(buffer);
  if (brands.length > 0) {
    if (brands.some((brand) => FTYP_HEIF_BRANDS.has(brand)))
      return 'image/heif';
    if (brands.some((brand) => FTYP_IMAGE_BRANDS.has(brand)))
      return 'image/heic';
    if (brands.some((brand) => FTYP_VIDEO_BRANDS.has(brand)))
      return 'video/mp4';
  }

  return undefined;
};

export default detectMimeTypeFromBuffer;

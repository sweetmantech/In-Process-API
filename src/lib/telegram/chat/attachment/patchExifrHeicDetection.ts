import exifr from 'exifr';
import { HEIC_FTYP_BRANDS } from '@/lib/media/heicFtypBrands';

let patched = false;

type ExifrFileLike = {
  getString: (o: number, l: number) => string;
  getUint32: (o: number) => number;
};

/**
 * exifr@7.1.3 rejects HEIC when the ftyp box exceeds 50 bytes (Apple multi-brand)
 * and only accepts the literal parser type (`heic`). Align detection with
 * isHeicBuffer: full ftyp size + the shared HEIC/HEIF brand set, including major.
 */
const patchExifrHeicDetection = (): void => {
  if (patched) return;

  const heicParser = exifr.fileParsers?.get?.('heic') as
    | {
        canHandle: (file: ExifrFileLike, marker: number) => boolean;
        type: string;
      }
    | undefined;

  if (!heicParser) return;

  heicParser.canHandle = function (file, firstTwoBytes) {
    if (firstTwoBytes !== 0) return false;
    if (file.getString(4, 4) !== 'ftyp') return false;

    const ftypLength = file.getUint32(0);
    if (ftypLength < 16 || ftypLength > 256) return false;

    const major = file.getString(8, 4);
    if (HEIC_FTYP_BRANDS.has(major)) return true;

    for (let offset = 16; offset + 4 <= ftypLength; offset += 4) {
      if (HEIC_FTYP_BRANDS.has(file.getString(offset, 4))) return true;
    }

    return false;
  };

  patched = true;
};

export default patchExifrHeicDetection;

import exifr from 'exifr';

let patched = false;

/**
 * exifr@7.1.3 rejects HEIC when the ftyp box exceeds 50 bytes, which happens
 * on Apple multi-brand files (e.g. styled photos). Patch detection to use the
 * full ftyp box size and compatible brands instead.
 */
const patchExifrHeicDetection = (): void => {
  if (patched) return;

  const heicParser = exifr.fileParsers?.get?.('heic') as
    | {
        canHandle: (
          file: {
            getString: (o: number, l: number) => string;
            getUint32: (o: number) => number;
          },
          marker: number
        ) => boolean;
        type: string;
      }
    | undefined;

  if (!heicParser) return;

  const original = heicParser.canHandle.bind(heicParser);
  heicParser.canHandle = function (file, firstTwoBytes) {
    if (firstTwoBytes !== 0) return false;
    if (file.getString(4, 4) !== 'ftyp') return false;

    const ftypLength = file.getUint32(0);
    if (ftypLength < 16 || ftypLength > 256) return false;

    for (let offset = 16; offset + 4 <= ftypLength; offset += 4) {
      if (file.getString(offset, 4) === this.type) return true;
    }

    return original(file, firstTwoBytes);
  };

  patched = true;
};

export default patchExifrHeicDetection;

import { describe, it, expect, beforeEach } from 'vitest';
import exifr from 'exifr';
import patchExifrHeicDetection from '../patchExifrHeicDetection';

type FileLike = {
  getString: (o: number, l: number) => string;
  getUint32: (o: number) => number;
};

const buildFtypFile = (brands: string[]): FileLike => {
  // size(4) + 'ftyp'(4) + major(4) + minor(4) + compatible brands
  const compatible = brands.slice(1);
  const ftypLength = 16 + compatible.length * 4;
  const buf = Buffer.alloc(ftypLength);
  buf.writeUInt32BE(ftypLength, 0);
  buf.write('ftyp', 4, 'ascii');
  buf.write(brands[0].padEnd(4, ' ').slice(0, 4), 8, 'ascii');
  buf.writeUInt32BE(0, 12);
  compatible.forEach((brand, index) => {
    buf.write(brand.padEnd(4, ' ').slice(0, 4), 16 + index * 4, 'ascii');
  });

  return {
    getString: (o, l) => buf.toString('ascii', o, o + l),
    getUint32: (o) => buf.readUInt32BE(o),
  };
};

describe('patchExifrHeicDetection', () => {
  beforeEach(() => {
    // Module caches the patch; calling again is a no-op after first import.
    patchExifrHeicDetection();
  });

  it('accepts HEIF files whose brands include mif1 but not literal heic', () => {
    const heicParser = exifr.fileParsers.get('heic') as {
      canHandle: (file: FileLike, marker: number) => boolean;
    };
    const file = buildFtypFile(['mif1', 'miaf', 'MiHB']);

    expect(heicParser.canHandle(file, 0)).toBe(true);
  });

  it('accepts major-brand heic even when compatible brands omit it', () => {
    const heicParser = exifr.fileParsers.get('heic') as {
      canHandle: (file: FileLike, marker: number) => boolean;
    };
    // Only major brand is heic; no compatible brands.
    const file = buildFtypFile(['heic']);

    expect(heicParser.canHandle(file, 0)).toBe(true);
  });

  it('rejects unrelated ftyp brands', () => {
    const heicParser = exifr.fileParsers.get('heic') as {
      canHandle: (file: FileLike, marker: number) => boolean;
    };
    const file = buildFtypFile(['isom', 'mp41']);

    expect(heicParser.canHandle(file, 0)).toBe(false);
  });
});

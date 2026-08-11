import { describe, it, expect } from 'vitest';
import readFtypBrands from '../readFtypBrands';
import isHeicBuffer from '../isHeicBuffer';

const buildFtypBuffer = (brands: string[]): Buffer => {
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
  return buf;
};

describe('readFtypBrands', () => {
  it('returns an empty array for non-ftyp bytes', () => {
    expect(readFtypBrands(Buffer.from('not-ftyp'))).toEqual([]);
  });

  it('includes the major brand as well as compatible brands', () => {
    expect(readFtypBrands(buildFtypBuffer(['heic', 'mif1', 'miaf']))).toEqual([
      'heic',
      'mif1',
      'miaf',
    ]);
  });
});

describe('isHeicBuffer', () => {
  it('returns false for non-HEIC bytes', () => {
    expect(isHeicBuffer(Buffer.from('not-an-image'))).toBe(false);
  });

  it('returns true for mif1-only HEIF brands', () => {
    expect(isHeicBuffer(buildFtypBuffer(['mif1', 'miaf']))).toBe(true);
  });
});

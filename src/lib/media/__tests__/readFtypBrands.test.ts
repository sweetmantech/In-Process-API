import { describe, it, expect } from 'vitest';
import readFtypBrands from '../readFtypBrands';

describe('readFtypBrands', () => {
  it('returns an empty array for non-ftyp bytes', () => {
    expect(readFtypBrands(Buffer.from('not-ftyp'))).toEqual([]);
  });
});

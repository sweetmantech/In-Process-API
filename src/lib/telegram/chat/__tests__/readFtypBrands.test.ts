import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import readFtypBrands from '../readFtypBrands';

describe('readFtypBrands', () => {
  it('reads compatible brands from a HEIC fixture', () => {
    const buffer = readFileSync(
      join(__dirname, 'fixtures', 'apple-styled-photo.heic')
    );

    expect(readFtypBrands(buffer)).toContain('heic');
  });

  it('returns an empty array for non-ftyp bytes', () => {
    expect(readFtypBrands(Buffer.from('not-ftyp'))).toEqual([]);
  });
});

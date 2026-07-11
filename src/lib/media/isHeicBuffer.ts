import readFtypBrands from './readFtypBrands';

const HEIC_BRANDS = new Set(['heic', 'heix', 'heim', 'heis', 'mif1']);
const HEIF_BRANDS = new Set(['heif', 'hevc', 'hevx', 'hevm', 'hevs', 'msf1']);

const isHeicBuffer = (buffer: Buffer): boolean => {
  const brands = readFtypBrands(buffer);
  return brands.some(
    (brand) => HEIC_BRANDS.has(brand) || HEIF_BRANDS.has(brand)
  );
};

export default isHeicBuffer;

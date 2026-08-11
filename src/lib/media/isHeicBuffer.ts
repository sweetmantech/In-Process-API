import readFtypBrands from './readFtypBrands';
import { HEIC_FTYP_BRANDS } from './heicFtypBrands';

const isHeicBuffer = (buffer: Buffer): boolean => {
  const brands = readFtypBrands(buffer);
  return brands.some((brand) => HEIC_FTYP_BRANDS.has(brand));
};

export default isHeicBuffer;

import getArchivoFont from './getArchivoFont';
import getSpectralFont from './getSpectralFont';

const getOgFonts = async (): Promise<{
  archivo: ArrayBuffer;
  spectral: ArrayBuffer;
}> => {
  const [archivo, spectral] = await Promise.all([
    getArchivoFont(),
    getSpectralFont(),
  ]);
  return { archivo, spectral };
};

export default getOgFonts;

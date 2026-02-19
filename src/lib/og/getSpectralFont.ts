import { SITE_ORIGINAL_URL } from '@/lib/consts';

const getSpectralFont = async (): Promise<ArrayBuffer> => {
  const res = await fetch(`${SITE_ORIGINAL_URL}/fonts/Spectral-Regular.ttf`);
  if (!res.ok) throw Error(`failed to fetch Spectral font: ${res.status}`);
  return res.arrayBuffer();
};

export default getSpectralFont;

import { SITE_ORIGINAL_URL } from '@/lib/consts';

const getArchivoFont = async (): Promise<ArrayBuffer> => {
  const res = await fetch(`${SITE_ORIGINAL_URL}/fonts/Archivo-Regular.ttf`);
  if (!res.ok) throw Error(`failed to fetch Archivo font: ${res.status}`);
  return res.arrayBuffer();
};

export default getArchivoFont;

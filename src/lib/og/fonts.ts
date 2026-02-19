import { SITE_ORIGINAL_URL } from '@/lib/consts';

export const archivoFont = fetch(
  `${SITE_ORIGINAL_URL}/fonts/Archivo-Regular.ttf`
).then((res) => res.arrayBuffer());

export const spectralFont = fetch(
  `${SITE_ORIGINAL_URL}/fonts/Spectral-Regular.ttf`
).then((res) => res.arrayBuffer());

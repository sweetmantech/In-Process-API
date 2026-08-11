/** Brands that map to image/heic in Telegram MIME sniffing. */
export const HEIC_IMAGE_BRANDS = new Set([
  'heic',
  'heix',
  'heim',
  'heis',
  'mif1',
]);

/** Brands that map to image/heif in Telegram MIME sniffing. */
export const HEIF_IMAGE_BRANDS = new Set([
  'heif',
  'hevc',
  'hevx',
  'hevm',
  'hevs',
  'msf1',
]);

/** Union used by isHeicBuffer / exifr canHandle. */
export const HEIC_FTYP_BRANDS = new Set([
  ...HEIC_IMAGE_BRANDS,
  ...HEIF_IMAGE_BRANDS,
]);

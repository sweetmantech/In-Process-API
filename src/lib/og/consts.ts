export const IN_PROCESS_LOGO_URL =
  'https://arweave.net/GlRVqkN9sLPSmN09CSLTAgc5lW-GaUg23I0-wRd2MwI';

export const rotation: any = {
  1: 'rotate(0deg)',
  3: 'rotate(180deg)',
  6: 'rotate(90deg)',
  8: 'rotate(270deg)',
};
export const OG_WIDTH = 500;
export const OG_HEIGHT = 333;
export const ARTIST_OG_IMAGE_WIDTH = 280;
export const ARTIST_OG_IMAGE_HEIGHT = 240;
export const WRITING_MAX_LINES = 14;
export const WRITING_SHORT_LINES = 3;

export const COLLAGE_PHOTO_W = 175;
export const COLLAGE_PHOTO_H = 165;

// Collage
export const COLS = 7;
export const SPROCKET_AREA_H = 26;
export const SPROCKET_HOLE_W = 28;
export const SPROCKET_HOLE_H = 18;
export const IMAGE_BORDER = 2;
export const DATE_AREA_H = 18;
/** neutral-800 — matches FilmPlaceholder strip colour */
export const FILM_COLOR = '#262626';
/** neutral-600/40 — matches FilmPlaceholder sprocket hole colour */
export const HOLE_COLOR = 'rgba(82, 82, 82, 0.4)';

// Pre-defined scattered positions: [x, y, rotateDeg]
// x/y = top-left corner of each photo (before rotation)
// Ordered periphery → center: older images go to edges, newer images to center
export const COLLAGE_PHOTO_LAYOUTS: [number, number, number][] = [
  [18, 27, 14], // far top-left
  [313, 13, -9], // far top-right
  [-12, 202, 6], // far left
  [-30, 330, 10], // far bottom-left
  [370, 110, -18], // far right-top
  [340, 270, 17], // far right
  [140, 360, -11], // bottom
  [250, 380, -3], // bottom-center
  [230, 55, 5], // top-center
  [88, 298, 8], // bottom-left
  [283, 303, -5], // bottom-right
  [43, 153, -16], // left-center
  [303, 178, -13], // right-center
  [183, 253, 11], // near-center
  [168, 122, -7], // center (newest image lands here, on top)
];

import { imageMeta } from 'image-meta';
import sharp from 'sharp';
import { ImageMetadata } from '@/types/og';
import fetchUriWithRetries from './fetchUriWithRetries';
import getSafeImageContentType from './getSafeImageContentType';

const getMomentPreview = async (
  previewBackgroundUrl: string
): Promise<ImageMetadata> => {
  const response = await fetchUriWithRetries(previewBackgroundUrl);
  const data = await response.arrayBuffer();
  const uint8Array = new Uint8Array(data);
  const meta = imageMeta(uint8Array);
  const orientation = meta.orientation || 1;
  const originalWidth = meta.width || 0;
  const originalHeight = meta.height || 1;

  let previewUrl: string;
  if (meta.type === 'webp') {
    const pngBuffer = await sharp(Buffer.from(data)).png().toBuffer();
    previewUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
  } else {
    const contentType = getSafeImageContentType(response.headers);
    previewUrl = `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;
  }

  return {
    orientation,
    originalWidth,
    originalHeight,
    shouldRotate: orientation === 6 || orientation === 8,
    previewUrl,
  };
};

export default getMomentPreview;

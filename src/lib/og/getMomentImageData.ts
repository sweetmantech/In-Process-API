import { imageMeta } from 'image-meta';
import sharp from 'sharp';
import { ImageMetadata } from '@/types/og';

const getMomentImageData = async (
  previewBackgroundUrl: string
): Promise<ImageMetadata> => {
  const response = await fetch(previewBackgroundUrl);
  if (!response.ok) throw Error('failed to get image metadata');
  const data = await response.arrayBuffer();
  const uint8Array = new Uint8Array(data);
  const meta = imageMeta(uint8Array);
  const orientation = meta.orientation || 1;
  const originalWidth = meta.width || 0;
  const originalHeight = meta.height || 1;

  let previewUrl = previewBackgroundUrl;
  if (meta.type === 'webp') {
    const pngBuffer = await sharp(Buffer.from(data)).png().toBuffer();
    previewUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
  }

  return {
    orientation,
    originalWidth,
    originalHeight,
    shouldRotate: orientation === 6 || orientation === 8,
    previewUrl,
  };
};

export default getMomentImageData;

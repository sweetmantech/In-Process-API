import { imageMeta } from 'image-meta';
import fetchUri from '../arweave/fetchUri';
import getSafeImageContentType from './getSafeImageContentType';

const getImageMetadata = async (previewBackgroundUrl: string | undefined) => {
  try {
    if (!previewBackgroundUrl) return null;

    const response = await fetchUri(previewBackgroundUrl);
    if (!response.ok) throw new Error();

    const data = await response.arrayBuffer();
    const uint8Array = new Uint8Array(data);
    const meta = imageMeta(uint8Array);
    if (!meta.width || !meta.height) throw new Error();

    const contentType = getSafeImageContentType(response.headers);
    const previewUrl = `data:${contentType};base64,${Buffer.from(data).toString('base64')}`;

    return {
      orientation: meta?.orientation || 1,
      originalWidth: meta.width || 1,
      originalHeight: meta.height,
      shouldRotate: meta?.orientation === 6 || meta?.orientation === 8,
      previewUrl,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getImageMetadata;

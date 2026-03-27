import sharp from 'sharp';
import fetchUri from '../arweave/fetchUri';

const MAX_SIZE = 120;

const getCollageImageData = async (
  imageUrl: string | undefined,
  signal?: AbortSignal
): Promise<string | null> => {
  try {
    if (!imageUrl) return null;

    const response = await fetchUri(imageUrl, { signal });
    if (!response.ok) return null;

    const data = await response.arrayBuffer();

    if (signal?.aborted) return null;

    const resized = await sharp(Buffer.from(data))
      .resize(MAX_SIZE, MAX_SIZE, { fit: 'cover' })
      .jpeg({ quality: 50 })
      .toBuffer();

    return `data:image/jpeg;base64,${resized.toString('base64')}`;
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return null;
    return null;
  }
};

export default getCollageImageData;

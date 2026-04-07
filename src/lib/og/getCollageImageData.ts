import sharp from 'sharp';
import fetchUri from '../arweave/fetchUri';

const MAX_SIZE = 200;

const getCollageImageData = async (
  imageUrl: string | undefined
): Promise<string | null> => {
  try {
    if (!imageUrl) return null;

    const response = await fetchUri(imageUrl, { cache: 'no-store' });
    if (!response.ok) return null;

    const data = await response.arrayBuffer();

    const resized = await sharp(Buffer.from(data))
      .resize(MAX_SIZE, MAX_SIZE, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();

    return `data:image/jpeg;base64,${resized.toString('base64')}`;
  } catch {
    return null;
  }
};

export default getCollageImageData;

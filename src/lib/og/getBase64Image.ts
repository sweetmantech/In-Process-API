import sharp from 'sharp';
import fetchUri from '../arweave/fetchUri';
import prepareImageBufferForSharp from '@/lib/media/prepareImageBufferForSharp';

const MAX_SIZE = 200;

const getBase64Image = async (
  imageUrl: string | undefined
): Promise<string | null> => {
  try {
    if (!imageUrl) return null;

    const response = await fetchUri(imageUrl);
    if (!response.ok) return null;

    const data = await response.arrayBuffer();
    const buffer = Buffer.from(data);
    const sharpInput = await prepareImageBufferForSharp(buffer);

    const resized = await sharp(sharpInput)
      .resize(MAX_SIZE, MAX_SIZE, { fit: 'cover' })
      .jpeg({ quality: 70 })
      .toBuffer();

    return `data:image/jpeg;base64,${resized.toString('base64')}`;
  } catch {
    return null;
  }
};

export default getBase64Image;

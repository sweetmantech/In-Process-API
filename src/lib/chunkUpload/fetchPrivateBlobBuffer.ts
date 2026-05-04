import { get } from '@vercel/blob';
import { Buffer } from 'node:buffer';

const fetchPrivateBlobBuffer = async (blobUrl: string): Promise<Buffer> => {
  const result = await get(blobUrl, { access: 'private' });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error('Blob not found');
  }
  const ab = await new Response(result.stream).arrayBuffer();
  return Buffer.from(ab);
};

export default fetchPrivateBlobBuffer;

import { del } from '@vercel/blob';
import isVercelBlobUrl from '@/lib/url/isVercelBlobUrl';

const getBlob = async (url: string) => {
  try {
    const headers: HeadersInit = {};
    if (isVercelBlobUrl(url)) {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(url, { headers });
    const type = response.headers.get('content-type') || '';
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type });
    if (isVercelBlobUrl(url)) await del(url);
    return { blob, type };
  } catch (error) {
    throw new Error(error as string);
  }
};

export default getBlob;

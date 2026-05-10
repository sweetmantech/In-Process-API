import { del } from '@vercel/blob';
import isVercelBlobUrl from '@/lib/url/isVercelBlobUrl';
import { retriesGeneric } from '@/lib/protocolSdk/retries';

const getBlob = async (url: string) => {
  const headers: HeadersInit = {};
  if (isVercelBlobUrl(url)) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await retriesGeneric({
    maxTries: 3,
    linearBackoffMS: 2_000,
    tryFn: async () => {
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return res;
    },
  });

  const type = response.headers.get('content-type') || '';
  const arrayBuffer = await response.arrayBuffer();
  const blob = new Blob([arrayBuffer], { type });
  if (isVercelBlobUrl(url)) await del(url);
  return { blob, type };
};

export default getBlob;

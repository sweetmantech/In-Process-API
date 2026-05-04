import getBlobReadWriteToken from '@/lib/vercel-blob/getBlobReadWriteToken';

const BLOB_API_URL =
  process.env.VERCEL_BLOB_API_URL ?? 'https://vercel.com/api/blob';
const BLOB_API_VERSION = '12';

export default async function blobDel(urls: string | string[]): Promise<void> {
  const list = Array.isArray(urls) ? urls : [urls];
  const res = await fetch(`${BLOB_API_URL}/delete`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${getBlobReadWriteToken()}`,
      'x-api-version': BLOB_API_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ urls: list }),
  });
  if (!res.ok) throw new Error(`Blob DELETE failed: ${res.status}`);
}

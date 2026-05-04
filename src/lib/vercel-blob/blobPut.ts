import getBlobReadWriteToken from '@/lib/vercel-blob/getBlobReadWriteToken';

const BLOB_API_URL =
  process.env.VERCEL_BLOB_API_URL ?? 'https://vercel.com/api/blob';
const BLOB_API_VERSION = '12';

export default async function blobPut(
  pathname: string,
  body: ArrayBuffer
): Promise<string> {
  const params = new URLSearchParams({ pathname });
  const res = await fetch(`${BLOB_API_URL}/?${params}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${getBlobReadWriteToken()}`,
      'x-api-version': BLOB_API_VERSION,
      'x-vercel-blob-access': 'private',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-content-type': 'application/octet-stream',
    },
    body,
  });
  if (!res.ok) throw new Error(`Blob PUT failed: ${res.status}`);
  const data = (await res.json()) as { url: string };
  return data.url;
}

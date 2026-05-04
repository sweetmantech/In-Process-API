import { Buffer } from 'node:buffer';

const BLOB_API_URL =
  process.env.VERCEL_BLOB_API_URL ?? 'https://vercel.com/api/blob';
const BLOB_API_VERSION = '12';

function getToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  return token;
}

export async function blobPut(
  pathname: string,
  body: ArrayBuffer
): Promise<string> {
  const params = new URLSearchParams({ pathname });
  const res = await fetch(`${BLOB_API_URL}/?${params}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${getToken()}`,
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

export async function blobDel(urls: string | string[]): Promise<void> {
  const list = Array.isArray(urls) ? urls : [urls];
  const res = await fetch(`${BLOB_API_URL}/delete`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${getToken()}`,
      'x-api-version': BLOB_API_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ urls: list }),
  });
  if (!res.ok) throw new Error(`Blob DELETE failed: ${res.status}`);
}

export async function blobGetBuffer(blobUrl: string): Promise<Buffer> {
  const res = await fetch(blobUrl, {
    headers: { authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`Blob GET failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

import { Buffer } from 'node:buffer';

import getBlobReadWriteToken from '@/lib/vercel-blob/getBlobReadWriteToken';

export default async function blobGetBuffer(blobUrl: string): Promise<Buffer> {
  const res = await fetch(blobUrl, {
    headers: { authorization: `Bearer ${getBlobReadWriteToken()}` },
  });
  if (!res.ok) throw new Error(`Blob GET failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

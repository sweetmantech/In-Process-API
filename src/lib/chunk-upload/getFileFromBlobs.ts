import { Buffer } from 'node:buffer';
import blobGetBuffer from '@/lib/vercel-blob/blobGetBuffer';

type ChunkBlobPart = {
  blob_url: string;
  byte_length: number;
};

type GetFileFromBlobsOpts = {
  filename: string;
  contentType: string;
  totalSizeBytes: number | null;
  maxTotalBytes: number;
};

type GetFileFromBlobsResult =
  | { ok: true; file: File }
  | { ok: false; status: 400 | 500; message: string };

const getFileFromBlobs = async (
  parts: ChunkBlobPart[],
  opts: GetFileFromBlobsOpts
): Promise<GetFileFromBlobsResult> => {
  const rej = (status: 400 | 500, message: string): GetFileFromBlobsResult => ({
    ok: false,
    status,
    message,
  });

  let sum = 0;
  const buffers: Buffer[] = [];

  for (const p of parts) {
    let buf: Buffer;
    try {
      buf = await blobGetBuffer(p.blob_url);
    } catch (e: unknown) {
      console.error('blobGetBuffer', e);
      return rej(500, 'Failed to read chunk from blob storage');
    }

    if (buf.length !== p.byte_length) {
      return rej(400, 'Chunk blob size mismatch');
    }

    sum += p.byte_length;
    buffers.push(buf);
  }

  if (opts.totalSizeBytes !== null && sum !== opts.totalSizeBytes) {
    return rej(400, 'Total size does not match total_size_bytes');
  }

  const fileBuf = Buffer.concat(buffers);

  if (fileBuf.length !== sum) {
    return rej(400, 'Assembled file size mismatch');
  }

  if (fileBuf.length > opts.maxTotalBytes) {
    return rej(
      400,
      `Assembled file exceeds max size of ${opts.maxTotalBytes} bytes`
    );
  }

  const file = new File([fileBuf], opts.filename, {
    type: opts.contentType,
  });

  return { ok: true, file };
};

export default getFileFromBlobs;

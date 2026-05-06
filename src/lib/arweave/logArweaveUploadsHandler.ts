import { NextResponse } from 'next/server';
import verifyArweaveTx from '@/lib/arweave/verifyArweaveTx';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import type { logArweaveUploadItemSchema } from '@/lib/schema/logArweaveUploadSchema';
import type { z } from 'zod';

type Upload = z.infer<typeof logArweaveUploadItemSchema>;

const logArweaveUploadsHandler = async (
  artistAddress: string,
  uploads: Upload[]
) => {
  const verifyResults = await Promise.all(
    uploads.map((u) => verifyArweaveTx(u.arweave_uri))
  );

  const logged: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < uploads.length; i++) {
    const upload = uploads[i];
    if (!verifyResults[i]) {
      failed.push(upload.arweave_uri);
      continue;
    }
    logArweaveUpload(
      { arweave_uri: upload.arweave_uri, winc_cost: upload.winc_cost },
      {
        file_size_bytes: upload.file_size_bytes,
        content_type: upload.content_type,
        artist_address: artistAddress,
      }
    );
    logged.push(upload.arweave_uri);
  }

  return NextResponse.json({ logged, failed });
};

export default logArweaveUploadsHandler;

import { NextResponse } from 'next/server';
import logArweaveUpload from '@/lib/arweave/logArweaveUpload';
import type { logArweaveUploadItemSchema } from '@/lib/schema/logArweaveUploadSchema';
import type { z } from 'zod';

type Upload = z.infer<typeof logArweaveUploadItemSchema>;

const logArweaveUploadsHandler = async (
  artistAddress: string,
  uploads: Upload[]
) => {
  const logged: string[] = [];

  for (const upload of uploads) {
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

  return NextResponse.json({ logged });
};

export default logArweaveUploadsHandler;

import { NextRequest } from 'next/server';
import validatePutChunkUpload from '@/lib/chunk-upload/validatePutChunkUpload';
import putChunkUploadHandler from '@/lib/chunk-upload/putChunkUploadHandler';

export async function PUT(req: NextRequest) {
  try {
    const validated = await validatePutChunkUpload(req);
    if (validated instanceof Response) return validated;
    const { session, chunkIndex } = validated;
    return putChunkUploadHandler(req, session, chunkIndex);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return Response.json({ message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

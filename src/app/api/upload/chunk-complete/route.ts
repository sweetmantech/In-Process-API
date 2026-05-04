import { NextRequest } from 'next/server';
import validateCompleteChunkUpload from '@/lib/chunk-upload/validateCompleteChunkUpload';
import completeChunkUploadHandler from '@/lib/chunk-upload/completeChunkUploadHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCompleteChunkUpload(req);
    if (validated instanceof Response) return validated;
    const { session_id } = validated;
    return completeChunkUploadHandler(session_id);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return Response.json({ message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest } from 'next/server';
import validateCreateChunkUploadSession from '@/lib/chunk-upload/validateCreateChunkUploadSession';
import createChunkUploadSessionHandler from '@/lib/chunk-upload/createChunkUploadSessionHandler';
import validatePatchChunkUpload from '@/lib/chunk-upload/validatePatchChunkUpload';
import patchChunkUploadHandler from '@/lib/chunk-upload/patchChunkUploadHandler';
import validateCompleteChunkUpload from '@/lib/chunk-upload/validateCompleteChunkUpload';
import completeChunkUploadHandler from '@/lib/chunk-upload/completeChunkUploadHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateChunkUploadSession(req);
    if (validated instanceof Response) return validated;
    const {
      artistAddress,
      filename,
      content_type,
      total_chunks,
      total_size_bytes,
      uploadType,
      usdcAmountMicros,
    } = validated;
    return createChunkUploadSessionHandler(artistAddress, {
      filename,
      content_type,
      total_chunks,
      total_size_bytes,
      uploadType,
      usdcAmountMicros,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return Response.json({ message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const validated = await validatePatchChunkUpload(req);
    if (validated instanceof Response) return validated;
    const { session, chunkIndex } = validated;
    return patchChunkUploadHandler(req, session, chunkIndex);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return Response.json({ message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

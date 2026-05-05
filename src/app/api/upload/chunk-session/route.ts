import { NextRequest } from 'next/server';
import validateCreateChunkUploadSession from '@/lib/chunk-upload/validateCreateChunkUploadSession';
import createChunkUploadSessionHandler from '@/lib/chunk-upload/createChunkUploadSessionHandler';

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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

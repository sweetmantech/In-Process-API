import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import getChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession';
import rejectUnlessUsableChunkUploadSession from '@/lib/chunk-upload/rejectUnlessUsableChunkUploadSession';

const validatePutChunkUpload = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const sessionId = req.headers.get('x-session-id')?.trim();
  if (!sessionId) {
    return NextResponse.json(
      { message: 'Missing header x-session-id' },
      { status: 400 }
    );
  }

  const rawIndex = req.headers.get('x-chunk-index')?.trim();
  if (!rawIndex) {
    return NextResponse.json(
      { message: 'Missing header x-chunk-index' },
      { status: 400 }
    );
  }

  const chunkIndex = Number.parseInt(rawIndex, 10);
  if (!Number.isInteger(chunkIndex) || chunkIndex < 0) {
    return NextResponse.json(
      { message: 'Invalid x-chunk-index' },
      { status: 400 }
    );
  }

  const { data: session, error } = await getChunkUploadSession(sessionId);
  const gated = rejectUnlessUsableChunkUploadSession(
    session,
    error,
    authResult.artistAddress
  );
  if (!gated.ok) return gated.response;

  const { session: unlocked } = gated;
  if (chunkIndex >= unlocked.total_chunks) {
    return NextResponse.json(
      { message: 'chunk_index out of range' },
      { status: 400 }
    );
  }

  return {
    session: unlocked,
    chunkIndex,
  };
};

export default validatePutChunkUpload;

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import getChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession';
import type { Database } from '@/lib/supabase/types';

type SessionRow =
  Database['public']['Tables']['in_process_chunk_upload_sessions']['Row'];

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
  if (error || !session) {
    return NextResponse.json(
      { message: 'Upload session not found' },
      { status: 404 }
    );
  }

  if (session.status !== 'open') {
    return NextResponse.json(
      { message: 'Upload session is not accepting chunks' },
      { status: 400 }
    );
  }

  if (new Date(session.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { message: 'Upload session expired' },
      { status: 410 }
    );
  }

  if (
    session.artist_address.toLowerCase() !==
    authResult.artistAddress.toLowerCase()
  ) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  if (chunkIndex >= session.total_chunks) {
    return NextResponse.json(
      { message: 'chunk_index out of range' },
      { status: 400 }
    );
  }

  return {
    callerAddress: authResult.artistAddress,
    session: session as SessionRow,
    chunkIndex,
  };
};

export default validatePutChunkUpload;

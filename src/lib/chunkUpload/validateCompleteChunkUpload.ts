import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import chunkUploadCompleteBodySchema from '@/lib/schema/chunkUploadCompleteBodySchema';
import getChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession';

const validateCompleteChunkUpload = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = validate(chunkUploadCompleteBodySchema, body);
  if (!parsed.success) return parsed.response;

  const { data: session, error } = await getChunkUploadSession(
    parsed.data.session_id
  );
  if (error || !session) {
    return NextResponse.json(
      { message: 'Upload session not found' },
      { status: 404 }
    );
  }

  if (session.status !== 'open') {
    return NextResponse.json(
      { message: 'Upload session is not ready to complete' },
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

  return {
    callerAddress: authResult.artistAddress,
    session_id: parsed.data.session_id,
  };
};

export default validateCompleteChunkUpload;

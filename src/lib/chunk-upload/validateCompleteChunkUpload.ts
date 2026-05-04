import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import chunkUploadCompleteBodySchema from '@/lib/schema/chunkUploadCompleteBodySchema';
import getChunkUploadSession from '@/lib/supabase/in_process_chunk_upload_sessions/getChunkUploadSession';
import rejectUnlessUsableChunkUploadSession from '@/lib/chunk-upload/rejectUnlessUsableChunkUploadSession';

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

  const gated = rejectUnlessUsableChunkUploadSession(
    session,
    error,
    authResult.artistAddress
  );
  if (!gated.ok) return gated.response;

  return {
    session_id: parsed.data.session_id,
  };
};

export default validateCompleteChunkUpload;

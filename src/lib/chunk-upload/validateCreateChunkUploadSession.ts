import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import chunkUploadSessionBodySchema from '@/lib/schema/chunkUploadSessionBodySchema';

const validateCreateChunkUploadSession = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = validate(chunkUploadSessionBodySchema, body);
  if (!parsed.success) return parsed.response;

  return { artistAddress: authResult.artistAddress, ...parsed.data };
};

export default validateCreateChunkUploadSession;

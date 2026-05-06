import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import logArweaveUploadSchema from '@/lib/schema/logArweaveUploadSchema';

const validateLogArweaveUpload = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { artistAddress } = authResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: 'Malformed JSON body' },
      { status: 400 }
    );
  }

  const result = validate(logArweaveUploadSchema, body);
  if (!result.success) return result.response;

  return { artistAddress, uploads: result.data };
};

export default validateLogArweaveUpload;

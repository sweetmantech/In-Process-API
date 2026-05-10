import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import herenowUploadSchema from '@/lib/schema/herenowUploadSchema';

const validateUpload = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const result = validate(herenowUploadSchema, body);
  if (!result.success) return result.response;

  return result.data;
};

export default validateUpload;

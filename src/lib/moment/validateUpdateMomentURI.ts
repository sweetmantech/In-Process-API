import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { updateMomentURISchema } from '@/lib/schema/updateMomentURISchema';

const validateUpdateMomentURI = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = await updateMomentURISchema.safeParseAsync(body);
  if (!result.success) {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return NextResponse.json(
      { message: 'Invalid input', errors },
      { status: 400 }
    );
  }

  return { artist: authResult, ...result.data };
};

export default validateUpdateMomentURI;

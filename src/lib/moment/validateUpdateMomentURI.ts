import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { updateMomentURISchema } from '@/lib/schema/updateMomentURISchema';
import { validate } from '@/lib/schema/validate';

const validateUpdateMomentURI = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(updateMomentURISchema, body);
  if (!result.success) return result.response;

  return { artistAddress: authResult.artistAddress, ...result.data };
};

export default validateUpdateMomentURI;

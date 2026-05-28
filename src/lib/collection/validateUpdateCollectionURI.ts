import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { updateCollectionURISchema } from '@/lib/schema/updateCollectionURISchema';

const validateUpdateCollectionURI = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const body = await req.json();
  const result = validate(updateCollectionURISchema, body);
  if (!result.success) return result.response;
  return { artistAddress: authResult.primaryWallet, ...result.data };
};

export default validateUpdateCollectionURI;

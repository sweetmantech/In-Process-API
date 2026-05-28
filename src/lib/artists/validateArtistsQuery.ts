import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import artistsQuerySchema from '@/lib/schema/artistsQuerySchema';

const validateArtistsQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { primaryWallet: callerAddress } = authResult;

  const result = validate(
    artistsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return { callerAddress, ...result.data };
};

export default validateArtistsQuery;

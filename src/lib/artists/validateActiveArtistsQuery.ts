import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import activeArtistsQuerySchema from '@/lib/schema/activeArtistsQuerySchema';
import { ADMIN_ADDRESSES } from '@/lib/consts';

const validateActiveArtistsQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { artistAddress } = authResult;

  if (!ADMIN_ADDRESSES.includes(artistAddress.toLowerCase())) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const result = validate(
    activeArtistsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return result.data;
};

export default validateActiveArtistsQuery;

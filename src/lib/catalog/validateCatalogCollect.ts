import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { catalogCollectSchema } from '@/lib/schema/catalogCollectSchema';

const validateCatalogCollect = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const body = await req.json();
  const result = validate(catalogCollectSchema, body);
  if (!result.success) return result.response;
  return { artistAddress: authResult.artistAddress, ...result.data };
};

export default validateCatalogCollect;

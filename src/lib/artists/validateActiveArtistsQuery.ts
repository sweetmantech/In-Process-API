import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';
import activeArtistsQuerySchema from '@/lib/schema/activeArtistsQuerySchema';

const validateActiveArtistsQuery = (req: NextRequest) => {
  const result = validate(
    activeArtistsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return result.data;
};

export default validateActiveArtistsQuery;

import { NextRequest } from 'next/server';
import artistCollageQuerySchema from '@/lib/schema/artistCollageQuerySchema';
import { validate } from '@/lib/schema/validate';

const validateArtistCollageQuery = (req: NextRequest) => {
  const result = validate(
    artistCollageQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;
  return result.data;
};

export default validateArtistCollageQuery;

import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';
import artistsCollectorsStatsQuerySchema from '@/lib/schema/artistsCollectorsStatsQuerySchema';

const validateArtistsCollectorsStatsQuery = (req: NextRequest) => {
  const result = validate(
    artistsCollectorsStatsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return result.data;
};

export default validateArtistsCollectorsStatsQuery;

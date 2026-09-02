import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';
import analyticsStatsQuerySchema from '@/lib/schema/analyticsStatsQuerySchema';

const validateAnalyticsStatsQuery = (req: NextRequest) => {
  const result = validate(
    analyticsStatsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return result.data;
};

export default validateAnalyticsStatsQuery;

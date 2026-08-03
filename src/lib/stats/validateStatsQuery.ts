import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';
import statsQuerySchema from '@/lib/schema/statsQuerySchema';

const validateStatsQuery = (req: NextRequest) => {
  const result = validate(
    statsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return result.data;
};

export default validateStatsQuery;

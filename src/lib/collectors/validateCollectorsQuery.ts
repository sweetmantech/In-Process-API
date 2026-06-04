import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';
import collectorsQuerySchema from '@/lib/schema/collectorsQuerySchema';

const validateCollectorsQuery = (req: NextRequest) => {
  const result = validate(
    collectorsQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return result.data;
};

export default validateCollectorsQuery;

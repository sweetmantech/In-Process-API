import { NextRequest } from 'next/server';
import { momentSchema } from '@/lib/schema/momentSchema';
import { validate } from '@/lib/schema/validate';

const validateMomentQuery = (req: NextRequest) => {
  const result = validate(
    momentSchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;
  return result.data;
};

export default validateMomentQuery;

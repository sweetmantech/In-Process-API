import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import { distributeSchema } from '@/lib/schema/distributeSchema';

const validateDistributeQuery = (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = validate(distributeSchema, params);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateDistributeQuery;

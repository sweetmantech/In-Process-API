import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import emailQuerySchema from '@/lib/schema/emailQuerySchema';

const validateEmailsQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { artistAddress: callerAddress } = authResult;

  const result = validate(
    emailQuerySchema,
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) return result.response;

  return { callerAddress, ...result.data };
};

export default validateEmailsQuery;

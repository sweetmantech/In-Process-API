import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import { oauthSchema } from '@/lib/schema/oauthSchema';

const validateOAuth = async (
  req: NextRequest
): Promise<NextResponse | { email: string }> => {
  const body = await req.json();
  const result = validate(oauthSchema, body);
  if (!result.success) return result.response;
  return result.data;
};

export default validateOAuth;

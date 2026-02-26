import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import { loginWithCodeSchema } from '@/lib/schema/loginWithCodeSchema';

const validateLoginWithCode = async (
  req: NextRequest
): Promise<NextResponse | { email: string; code: string }> => {
  const body = await req.json();
  const result = validate(loginWithCodeSchema, body);
  if (!result.success) return result.response;
  return result.data;
};

export default validateLoginWithCode;

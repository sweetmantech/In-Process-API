import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import { farcasterAuthSchema } from '@/lib/schema/farcasterAuthSchema';

const validateFarcasterAuthBody = async (req: NextRequest) => {
  const body = await req.json();
  const result = validate(farcasterAuthSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateFarcasterAuthBody;

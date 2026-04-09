import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';
import { farcasterAuthSchema } from '@/lib/schema/farcasterAuthSchema';

const validateFarcasterAuthBody = async (req: NextRequest) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        message: 'Invalid input',
        errors: [{ field: '', message: 'Malformed JSON body' }],
      },
      { status: 400 }
    );
  }
  const result = validate(farcasterAuthSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateFarcasterAuthBody;

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { airdropMomentSchema } from '@/lib/schema/airdropMomentSchema';
import { Address } from 'viem';

const validateAirdropMoment = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
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
  const result = validate(airdropMomentSchema, body);
  if (!result.success) return result.response;
  return { artist: authResult, ...result.data };
};

export default validateAirdropMoment;

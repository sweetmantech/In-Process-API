import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import createProfileSchema from '@/lib/schema/createProfileSchema';
import { ADMIN_ADDRESSES } from '@/lib/consts';

const validateCreateProfileBody = async (req: NextRequest) => {
  // Accept all three auth methods supported by authMiddleware
  // (Privy bearer token, Farcaster auth token, x-api-key).
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(createProfileSchema, body);
  if (!result.success) return result.response;

  const callerAddress = authResult.artistAddress.toLowerCase();
  const isAdmin = ADMIN_ADDRESSES.includes(callerAddress);
  if (!isAdmin && callerAddress !== result.data.address) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  return result.data;
};

export default validateCreateProfileBody;

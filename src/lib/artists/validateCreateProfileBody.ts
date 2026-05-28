import { NextRequest, NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import { AuthErrorTypes } from '@/errors';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';
import { getFarcasterAuthToken } from '@/lib/api-keys/getFarcasterAuthToken';
import { validate } from '@/lib/schema/validate';
import createProfileSchema from '@/lib/schema/createProfileSchema';

const validateCreateProfileBody = async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  const bearerToken = getBearerToken(authHeader);
  const farcasterToken = getFarcasterAuthToken(authHeader);
  const apiKey = req.headers.get('x-api-key');

  if (!bearerToken && !farcasterToken && !apiKey) {
    return NextResponse.json(
      { message: AuthErrorTypes.UNAUTHORIZED },
      { status: 401 }
    );
  }

  const body = await req.json();
  const result = validate(createProfileSchema, body);
  if (!result.success) return result.response;

  if (farcasterToken) {
    return {
      method: AuthMethod.Farcaster,
      token: farcasterToken,
      ...result.data,
    };
  }
  if (bearerToken) {
    return {
      method: AuthMethod.Privy,
      token: bearerToken,
      ...result.data,
    };
  }
  return {
    method: AuthMethod.ApiKey,
    token: apiKey as string,
    ...result.data,
  };
};

export default validateCreateProfileBody;

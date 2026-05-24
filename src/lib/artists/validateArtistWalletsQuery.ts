import { NextRequest, NextResponse } from 'next/server';
import { AuthErrorTypes } from '@/errors';
import { getBearerToken } from '../api-keys/getBearerToken';
import { getFarcasterAuthToken } from '../api-keys/getFarcasterAuthToken';
import { AuthMethod } from '@/types/auth';

const validateArtistWalletsQuery = (req: NextRequest) => {
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

  if (bearerToken)
    return {
      method: AuthMethod.Privy,
      token: bearerToken,
    };
  if (farcasterToken)
    return {
      method: AuthMethod.Farcaster,
      token: farcasterToken,
    };
  return {
    method: AuthMethod.ApiKey,
    token: apiKey as string,
  };
};

export default validateArtistWalletsQuery;

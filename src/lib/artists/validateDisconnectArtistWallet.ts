import { NextRequest, NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import { AuthErrorTypes } from '@/errors';
import { getBearerToken } from '../api-keys/getBearerToken';

const validateDisconnectArtistWallet = async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  const bearerToken = getBearerToken(authHeader);
  const apiKey = req.headers.get('x-api-key');

  if (!bearerToken && !apiKey) {
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
  return {
    method: AuthMethod.ApiKey,
    token: apiKey as string,
  };
};

export default validateDisconnectArtistWallet;

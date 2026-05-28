import { AuthErrorTypes } from '@/errors';
import { NextRequest } from 'next/server';
import { getBearerToken } from '../api-keys/getBearerToken';
import { AuthMethod } from '@/types/auth';

const validateAuthHeader = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  const bearerToken = getBearerToken(authHeader);
  const apiKey = req.headers.get('x-api-key');
  const farcasterToken = req.headers.get('farcaster-token');

  if (!bearerToken && !apiKey && !farcasterToken) {
    throw new Error(AuthErrorTypes.UNAUTHORIZED);
  }

  if (farcasterToken)
    return { method: AuthMethod.Farcaster, authorization: farcasterToken };
  if (bearerToken)
    return { method: AuthMethod.Privy, authorization: bearerToken };
  return { method: AuthMethod.ApiKey, authorization: apiKey as string };
};

export default validateAuthHeader;

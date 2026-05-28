import { NextResponse } from 'next/server';
import { AuthErrorMessages, AuthErrorTypes } from '@/errors';
import { AuthMethod } from '@/types/auth';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import authenticateWithBearerToken from '@/lib/auth/authenticateWithBearerToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import isAuthError from '@/lib/auth/isAuthError';
import { Address } from 'viem';

interface AuthTokens {
  farcasterToken: string | null;
  bearerToken: string | null;
  apiKey: string | null;
}

interface ResolvedAuth {
  primaryWallet: Address;
  wallets: Address[];
  artistId: string;
  authMethod: AuthMethod;
}

const authenticate = async (
  tokens: AuthTokens
): Promise<NextResponse | ResolvedAuth> => {
  try {
    const { farcasterToken, bearerToken, apiKey } = tokens;
    if (farcasterToken)
      return await authenticateWithFarcasterToken(farcasterToken);
    if (bearerToken) return await authenticateWithBearerToken(bearerToken);
    if (apiKey) return await authenticateWithApiKey(apiKey);
    throw new Error(AuthErrorMessages.NO_VALID_AUTH_METHOD);
  } catch (error: any) {
    if (isAuthError(error)) {
      return NextResponse.json(
        { message: AuthErrorTypes.INVALID_AUTHENTICATION },
        { status: 401 }
      );
    }
    throw error;
  }
};

export default authenticate;

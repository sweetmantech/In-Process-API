import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';
import { getAddressesByAuthToken } from '@/lib/privy/getAddressesByAuthToken';
import { getArtistAddressByApiKey } from '@/lib/api-keys/getArtistAddressByApiKey';
import { AuthErrorMessages, AuthErrorTypes } from './errors';

export interface AuthResult {
  artistAddress: string;
  authMethod: 'token' | 'apiKey';
}

/**
 * Authentication middleware that validates either:
 * 1. Auth token, OR
 * 2. API key
 *
 * Returns the artist address and authentication method used.
 */
export async function authMiddleware(
  req: NextRequest
): Promise<NextResponse | AuthResult> {
  const authHeader = req.headers.get('authorization');
  const authToken = getBearerToken(authHeader);
  const apiKey = req.headers.get('x-api-key');

  // Require either auth token or API key
  if (!authToken && !apiKey) {
    return NextResponse.json(
      { message: AuthErrorTypes.UNAUTHORIZED },
      { status: 401 }
    );
  }

  // Get artist address from either auth token or API key
  let artistAddress: string;
  let authMethod: 'token' | 'apiKey';

  try {
    if (authToken) {
      const {
        artistAddress: artistAddressFromToken,
        socialWallet: socialWalletFromToken,
      } = await getAddressesByAuthToken(authToken);
      artistAddress = artistAddressFromToken || socialWalletFromToken || '';
      authMethod = 'token';
    } else if (apiKey) {
      artistAddress = await getArtistAddressByApiKey(apiKey);
      authMethod = 'apiKey';
    } else {
      throw new Error(AuthErrorMessages.NO_VALID_AUTH_METHOD);
    }
  } catch (error: any) {
    // Handle authentication errors specifically
    if (
      error?.message?.includes(AuthErrorMessages.INVALID_AUTH_TOKEN) ||
      error?.message?.includes(AuthErrorMessages.NO_SOCIAL_OR_ARTIST_WALLET) ||
      error?.message?.includes(AuthErrorMessages.INVALID_API_KEY) ||
      error?.message?.includes(
        AuthErrorMessages.NO_ARTIST_ADDRESS_FOR_API_KEY
      ) ||
      error?.message?.includes(AuthErrorMessages.NO_VALID_AUTH_METHOD)
    ) {
      return NextResponse.json(
        { message: AuthErrorTypes.INVALID_AUTHENTICATION },
        { status: 401 }
      );
    }

    throw error;
  }

  return {
    artistAddress,
    authMethod,
  };
}

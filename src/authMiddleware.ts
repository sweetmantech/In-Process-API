import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';
import { getFarcasterAuthToken } from '@/lib/api-keys/getFarcasterAuthToken';
import { getAddressesByAuthToken } from '@/lib/privy/getAddressesByAuthToken';
import { getArtistAddressByApiKey } from '@/lib/api-keys/getArtistAddressByApiKey';
import { verifyJwt } from '@/lib/jwt/verifyJwt';
import verifyFarcasterAuth from '@/lib/farcaster/verifyFarcasterAuth';
import { farcasterAuthSchema } from '@/lib/schema/farcasterAuthSchema';
import { AuthErrorMessages, AuthErrorTypes } from './errors';
import { AuthResult, AuthMethod } from '@/types/auth';

export async function authMiddleware(
  req: NextRequest
): Promise<NextResponse | AuthResult> {
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

  let artistAddress: string;
  let authMethod: AuthMethod;

  try {
    if (farcasterToken) {
      const secret = process.env.FARCASTER_JWT_SECRET;
      if (!secret) throw new Error('FARCASTER_JWT_SECRET is not configured');
      const raw = verifyJwt(farcasterToken, secret);
      const parsed = farcasterAuthSchema.safeParse(raw);
      if (!parsed.success)
        throw new Error(AuthErrorMessages.INVALID_AUTH_TOKEN);
      artistAddress = await verifyFarcasterAuth(
        parsed.data.message,
        parsed.data.signature
      );
      authMethod = AuthMethod.FARCaster;
    } else if (bearerToken) {
      const {
        artistAddress: artistAddressFromToken,
        socialWallet: socialWalletFromToken,
      } = await getAddressesByAuthToken(bearerToken);
      artistAddress = artistAddressFromToken || socialWalletFromToken || '';
      authMethod = AuthMethod.Privy;
    } else if (apiKey) {
      artistAddress = await getArtistAddressByApiKey(apiKey);
      authMethod = AuthMethod.ApiKey;
    } else {
      throw new Error(AuthErrorMessages.NO_VALID_AUTH_METHOD);
    }
  } catch (error: any) {
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

  return { artistAddress, authMethod };
}

import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';
import { getFarcasterAuthToken } from '@/lib/api-keys/getFarcasterAuthToken';
import { AuthErrorTypes } from './errors';
import { AuthResult } from '@/types/auth';
import verifyRecaptchaToken from '@/lib/recaptcha/verifyRecaptchaToken';
import authenticate from '@/lib/auth/authenticate';

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

  const resolved = await authenticate({ farcasterToken, bearerToken, apiKey });
  if (resolved instanceof NextResponse) return resolved;

  const recaptchaToken = req.headers.get('x-recaptcha-token');
  const isOfficialArtist = recaptchaToken
    ? await verifyRecaptchaToken(recaptchaToken)
    : false;

  console.log('[authMiddleware]', { ...resolved, isOfficialArtist });

  return { ...resolved, isOfficialArtist };
}

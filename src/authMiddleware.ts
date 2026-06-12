import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';
import { getFarcasterAuthToken } from '@/lib/api-keys/getFarcasterAuthToken';
import { AuthErrorTypes } from './errors';
import { AuthResult } from '@/types/auth';
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

  const authenticated = await authenticate({
    farcasterToken,
    bearerToken,
    apiKey,
  });
  if (authenticated instanceof NextResponse) return authenticated;

  console.log('[authMiddleware]', authenticated);

  return authenticated;
}

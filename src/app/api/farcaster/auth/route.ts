import { NextRequest, NextResponse } from 'next/server';
import validateFarcasterAuthBody from '@/lib/farcaster/validateFarcasterAuthBody';
import farcasterAuthHandler from '@/lib/farcaster/farcasterAuthHandler';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateFarcasterAuthBody(req);
    if (validated instanceof NextResponse) return validated;
    const { message, signature } = validated;
    const result = await farcasterAuthHandler(message, signature);
    return Response.json(result);
  } catch (e: any) {
    const isAuthError =
      e?.message === 'Expired nonce' || e?.message === 'Invalid signature';
    if (isAuthError) {
      return Response.json({ message: e.message }, { status: 401 });
    }
    console.error('[POST /api/farcaster/auth]', e);
    return Response.json({ message: 'Authentication failed' }, { status: 500 });
  }
}

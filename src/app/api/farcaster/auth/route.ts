import { NextRequest } from 'next/server';
import { verifyFarcasterAuth } from '@/lib/farcaster/verifyFarcasterAuth';
import { signJwt } from '@/lib/jwt/signJwt';

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();
    if (!message || !signature) {
      return Response.json(
        { message: 'message and signature are required' },
        { status: 400 }
      );
    }

    await verifyFarcasterAuth(message, signature);

    const token = signJwt(
      { message, signature },
      process.env.FARCASTER_JWT_SECRET!
    );

    return Response.json({ token });
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'Authentication failed' },
      { status: 401 }
    );
  }
}

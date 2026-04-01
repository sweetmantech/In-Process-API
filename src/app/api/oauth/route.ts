import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import getArtistProfile from '@/lib/getArtistProfile';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof NextResponse) return authResult;
    const { artistAddress } = authResult;
    const profile = await getArtistProfile(artistAddress.toLowerCase());
    return NextResponse.json({ artistAddress, profile });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';

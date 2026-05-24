import { NextRequest, NextResponse } from 'next/server';
import validateArtistWalletsQuery from '@/lib/artists/validateArtistWalletsQuery';
import getArtistWalletsHandler from '@/lib/artists/getArtistWalletsHandler';
import validateConnectArtistWalletBody from '@/lib/artists/validateConnectArtistWalletBody';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';
import disconnectArtistWalletHandler from '@/lib/artists/disconnectArtistWalletHandler';
import { authMiddleware } from '@/authMiddleware';

export async function GET(req: NextRequest) {
  try {
    const validated = validateArtistWalletsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getArtistWalletsHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to get the artist wallets.';
    return Response.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const validated = await validateConnectArtistWalletBody(req);
    if (validated instanceof NextResponse) return validated;
    return connectArtistWalletHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to connect.';
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (authResult instanceof Response) return authResult as NextResponse;
    return disconnectArtistWalletHandler(authResult);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to disconnect a social wallet';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

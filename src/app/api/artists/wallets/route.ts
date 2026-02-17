import { NextRequest, NextResponse } from 'next/server';
import validateArtistWalletQuery from '@/lib/artists/validateArtistWalletQuery';
import getArtistWalletHandler from '@/lib/artists/getArtistWalletHandler';
import validateConnectArtistWalletBody from '@/lib/artists/validateConnectArtistWalletBody';
import connectArtistWalletHandler from '@/lib/artists/connectArtistWalletHandler';
import validateDisconnectArtistWalletBody from '@/lib/artists/validateDisconnectArtistWalletBody';
import disconnectArtistWalletHandler from '@/lib/artists/disconnectArtistWalletHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateArtistWalletQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getArtistWalletHandler(validated.social_wallet);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get an artist wallet.';
    return Response.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const validated = await validateConnectArtistWalletBody(req);
    if (validated instanceof NextResponse) return validated;
    return connectArtistWalletHandler(
      validated.artist_wallet,
      validated.social_wallet
    );
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to connect.';
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validated = await validateDisconnectArtistWalletBody(req);
    if (validated instanceof NextResponse) return validated;
    return disconnectArtistWalletHandler(validated.social_wallet);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to disconnect a social wallet';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import validateArtistWalletsQuery from '@/lib/wallets/validateArtistWalletsQuery';
import getArtistWalletsHandler from '@/lib/wallets/getArtistWalletsHandler';
import disconnectWalletHandler from '@/lib/wallets/disconnectWalletHandler';
import validateWalletDisconnect from '@/lib/wallets/validateWalletDisconnect';
import validateWalletConnectBody from '@/lib/wallets/validateWalletConnectBody';
import connectWalletHandler from '@/lib/wallets/connectWalletHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateArtistWalletsQuery(req);
    if (validated instanceof NextResponse) return validated;
    const { wallets } = await getArtistWalletsHandler(validated);
    return Response.json({ wallets });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to get the wallets.';
    return Response.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const validated = await validateWalletConnectBody(req);
    if (validated instanceof NextResponse) return validated;
    return await connectWalletHandler(validated);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Failed to connect a wallet';
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validated = await validateWalletDisconnect(req);
    if (validated instanceof NextResponse) return validated;
    return await disconnectWalletHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to disconnect a wallet';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

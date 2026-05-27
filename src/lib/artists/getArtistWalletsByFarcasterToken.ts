import { NextResponse } from 'next/server';
import authenticateWithFarcasterToken from '../auth/authenticateWithFarcasterToken';
import selectWallets from '../supabase/in_process_wallets/selectWallets';

const getArtistWalletsByFarcasterToken = async (token: string) => {
  const { artistAddress: farcasterAddress } =
    await authenticateWithFarcasterToken(token);

  const { data: walletRows } = await selectWallets({
    addresses: [farcasterAddress],
  });
  const artistId = walletRows?.[0]?.artist_id;

  if (!artistId) {
    return NextResponse.json({
      artist_wallet: undefined,
      social_wallets: [farcasterAddress],
    });
  }

  // Pull every wallet owned by the artist in a single query so we can pick
  // the user-facing (external) one as artist_wallet and surface the rest as
  // social_wallets.
  const { data: artistWallets } = await selectWallets({
    artistIds: [artistId],
  });
  const external = artistWallets?.find((w) => w.type === 'external')?.address;
  const privy = artistWallets?.find((w) => w.type === 'privy')?.address;

  const artist_wallet = external ?? privy;
  const social_wallets = [
    external ? privy : undefined,
    farcasterAddress,
  ].filter(Boolean) as string[];

  return NextResponse.json({ artist_wallet, social_wallets });
};

export default getArtistWalletsByFarcasterToken;

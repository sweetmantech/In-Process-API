import { NextResponse } from 'next/server';
import { AuthMethod } from '@/types/auth';
import getPrivyLinkedAccounts from '@/lib/privy/getPrivyLinkedAccounts';
import authenticateWithFarcasterToken from '@/lib/auth/authenticateWithFarcasterToken';
import authenticateWithApiKey from '@/lib/auth/authenticateWithApiKey';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import updateArtistById from '@/lib/supabase/in_process_artists/updateArtistById';
import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';

type ProfileFields = {
  username?: string;
  bio?: string;
  instagram?: string;
  x?: string;
  telegram?: string;
};

const createProfileHandler = async ({
  method,
  token,
  ...fields
}: {
  method: AuthMethod;
  token: string;
} & ProfileFields) => {
  if (method === AuthMethod.Privy) {
    const { socialWalletAddress } = await getPrivyLinkedAccounts(token);
    if (!socialWalletAddress) {
      throw new Error('Privy social wallet not found');
    }
    const { data: walletRows } = await selectWallets({
      addresses: [socialWalletAddress],
    });
    const artistId = walletRows?.[0]?.artist;
    if (!artistId) {
      throw new Error('Wallet is not linked to an artist');
    }
    await updateArtistById(artistId, fields);
    return NextResponse.json({ success: true });
  }

  if (method === AuthMethod.Farcaster) {
    const { artistAddress } = await authenticateWithFarcasterToken(token);
    await upsertArtists({ address: artistAddress.toLowerCase(), ...fields });
    return NextResponse.json({ success: true });
  }

  const { artistAddress } = await authenticateWithApiKey(token);
  await upsertArtists({ address: artistAddress.toLowerCase(), ...fields });
  return NextResponse.json({ success: true });
};

export default createProfileHandler;

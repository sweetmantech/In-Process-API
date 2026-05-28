import { NextResponse } from 'next/server';
import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import { WalletType } from '@/types/wallets';
import getArtistSmartWallet from '@/lib/smartwallets/getArtistSmartWallet';
import { getCanonicalSmartAccount } from '@/lib/coinbase/getCanonicalSmartAccount';

const connectWalletHandler = async ({
  artistId,
  address,
  clientType,
}: {
  artistId: string;
  address: Address;
  clientType: string;
}) => {
  await upsertWallets([
    {
      address: address.toLowerCase(),
      artist: artistId,
      type: clientType as WalletType,
    },
  ]);

  // Ensure the artist has a canonical smart wallet (creates one if missing)
  const existing = await getArtistSmartWallet(artistId);
  if (!existing) {
    await getCanonicalSmartAccount({ artistId });
  }

  return NextResponse.json({ success: true });
};

export default connectWalletHandler;

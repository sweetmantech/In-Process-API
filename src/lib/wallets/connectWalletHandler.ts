import { NextResponse } from 'next/server';
import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import { WalletType } from '@/types/wallets';

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

  return NextResponse.json({ success: true });
};

export default connectWalletHandler;

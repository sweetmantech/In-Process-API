import { NextResponse } from 'next/server';
import { Address } from 'viem';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';

const disconnectWalletHandler = async ({ address }: { address: Address }) => {
  await upsertWallets([{ address: address.toLowerCase(), artist: null }]);
  return NextResponse.json({ success: true });
};

export default disconnectWalletHandler;

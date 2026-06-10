import { Address, formatEther, formatUnits } from 'viem';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import migrateSmartWalletFunds from '@/lib/artists/migrateSmartWalletFunds';
import { getSmartWalletBalancesSchema } from '@/lib/schema/getSmartWalletBalancesSchema';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { Tables } from '@/lib/supabase/types';
import getPrimaryWallet from '@/lib/wallets/getPrimaryWallet';
import getWalletBalance from '@/lib/viem/getWalletBalance';
import getArtistSmartWallet from '@/lib/smartwallets/getArtistSmartWallet';

type GetSmartWalletBalancesInput = z.infer<typeof getSmartWalletBalancesSchema>;

const getSmartWalletBalancesHandler = async ({
  artistId,
  chainId,
}: GetSmartWalletBalancesInput) => {
  const [smartWalletAddress, { data: wallets }] = await Promise.all([
    getArtistSmartWallet(artistId),
    selectWallets({ artistIds: [artistId] }),
  ]);

  if (!smartWalletAddress) {
    return NextResponse.json({ message: 'Smart wallet not found' }, { status: 404 });
  }

  const primaryWallet = getPrimaryWallet(
    (wallets ?? []).filter(
      (w) => w.type !== 'smart'
    ) as Tables<'in_process_wallets'>[]
  ) as Address | undefined;
  if (primaryWallet) {
    await migrateSmartWalletFunds({
      legacyWalletAddress: primaryWallet,
      primarySmartAccountAddress: smartWalletAddress,
      chainId,
    });
  }

  const { ethBalance, usdcBalance } = await getWalletBalance(smartWalletAddress, chainId);

  return NextResponse.json({
    address: smartWalletAddress,
    eth_balance: formatEther(ethBalance),
    usdc_balance: formatUnits(usdcBalance, 6),
  });
};

export default getSmartWalletBalancesHandler;

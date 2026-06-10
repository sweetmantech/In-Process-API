import { Address, formatEther, formatUnits } from 'viem';
import { z } from 'zod';
import { NextResponse } from 'next/server';
import migrateSmartWalletFunds from '@/lib/artists/migrateSmartWalletFunds';
import { getArtistSmartAccount } from '@/lib/coinbase/getArtistSmartAccount';
import { getSmartWalletBalancesSchema } from '@/lib/schema/getSmartWalletBalancesSchema';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { Tables } from '@/lib/supabase/types';
import getPrimaryWallet from '@/lib/wallets/getPrimaryWallet';
import getWalletBalance from '@/lib/viem/getWalletBalance';

type GetSmartWalletBalancesInput = z.infer<typeof getSmartWalletBalancesSchema>;

const getSmartWalletBalancesHandler = async ({
  artistId,
  chainId,
}: GetSmartWalletBalancesInput) => {
  const [canonicalAccount, { data: wallets }] = await Promise.all([
    getArtistSmartAccount({ artistId }),
    selectWallets({ artistIds: [artistId] }),
  ]);

  const canonicalAddress = canonicalAccount.address.toLowerCase() as Address;

  const primaryWallet = getPrimaryWallet(
    (wallets ?? []).filter(
      (w) => w.type !== 'smart'
    ) as Tables<'in_process_wallets'>[]
  ) as Address | undefined;
  if (primaryWallet) {
    await migrateSmartWalletFunds({
      legacyWalletAddress: primaryWallet,
      canonicalSmartAccountAddress: canonicalAccount.address as Address,
      chainId,
    });
  }

  const { ethBalance, usdcBalance } = await getWalletBalance(
    canonicalAddress,
    chainId
  );

  return NextResponse.json({
    address: canonicalAddress,
    eth_balance: formatEther(ethBalance),
    usdc_balance: formatUnits(usdcBalance, 6),
  });
};

export default getSmartWalletBalancesHandler;

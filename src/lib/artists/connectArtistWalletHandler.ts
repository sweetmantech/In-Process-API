import { NextResponse } from 'next/server';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { Address } from 'viem';
import migrateMoments from '@/lib/moment/migrateMoments';
import { retriesGeneric } from '@/lib/protocolSdk/retries';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import upsertWallets from '@/lib/supabase/in_process_wallets/upsertWallets';
import migrateProfile from './migrateProfile';
import migrateSmartWalletFunds from './migrateSmartWalletFunds';

const connectArtistWalletHandler = async ({
  artist_wallet,
  social_wallet,
}: {
  artist_wallet: Address;
  social_wallet: Address;
}) => {
  const artistSmartAccount = await getOrCreateSmartWallet({
    address: artist_wallet,
  });

  // 1. Migrate profile from social wallet to artist wallet
  await migrateProfile({
    social_wallet,
    artist_wallet,
  });

  const socialSmartAccount = await getOrCreateSmartWallet({
    address: social_wallet,
  });

  // 2. Migrate moments from social wallet to artist wallet
  await retriesGeneric({
    tryFn: async () => {
      await migrateMoments({
        socialWallet: {
          address: social_wallet,
          smartAccount: socialSmartAccount,
        },
        artistWallet: {
          address: artist_wallet,
          smartWalletAddress: artistSmartAccount.address as Address,
        },
      });
    },
    maxTries: 3,
    linearBackoffMS: 200,
  });

  // 3. Migrate ETH and USDC from social wallet's smart wallet to artist wallet's smart wallet
  await migrateSmartWalletFunds({
    socialSmartAccount,
    artistSmartWalletAddress: artistSmartAccount.address as Address,
  });

  // 4. Connect social wallet to artist wallet
  const { data: artistWalletRows } = await selectWallets({
    addresses: [artist_wallet.toLowerCase()],
  });
  const artistUuid = artistWalletRows?.[0]?.artist_id;
  if (!artistUuid) throw new Error('Artist wallet not found');

  const { data: existingRows } = await selectWallets({
    addresses: [social_wallet.toLowerCase()],
  });
  const existingArtist = existingRows?.[0]?.artist_id;
  if (existingArtist && existingArtist !== artistUuid) {
    throw new Error('social_wallet is connected already.');
  }

  await upsertWallets([
    { address: social_wallet.toLowerCase(), artist: artistUuid, type: 'privy' },
  ]);

  return NextResponse.json({ success: true });
};

export default connectArtistWalletHandler;

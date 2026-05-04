import { NextResponse } from 'next/server';
import { insertSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/insertSocialWallet';
import { getOrCreateSmartWallet } from '@/lib/coinbase/getOrCreateSmartWallet';
import { Address } from 'viem';
import migrateMoments from '@/lib/moment/migrateMoments';
import { retriesGeneric } from '@/lib/protocolSdk/retries';
import migrateApiKey from './migrateApiKey';
import migrateProfile from './migrateProfile';

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

  // 2. Migrate api keys from social wallet to artist wallet
  await migrateApiKey({
    social_wallet,
    artist_wallet,
  });

  // 3. Migrate moments from social wallet to artist wallet
  await retriesGeneric({
    tryFn: async () => {
      await migrateMoments({
        socialWallet: social_wallet,
        artistWallet: {
          address: artist_wallet,
          smartWalletAddress: artistSmartAccount.address as Address,
        },
      });
    },
    maxTries: 3,
    linearBackoffMS: 200,
  });

  // 4. Connect social wallet to artist wallet
  const { error: insertError } = await insertSocialWallet({
    artist_address: artist_wallet,
    social_wallet,
  });
  if (insertError) throw new Error('social_wallet is connected already.');

  return NextResponse.json({ success: true });
};

export default connectArtistWalletHandler;

import migrateApiKey from '@/lib/artists/migrateApiKey';
import { removeSocialWallet } from '@/lib/supabase/in_process_artist_social_wallets/removeSocialWallet';

const disconnectWallets = async ({
  social_wallet,
  external_wallet,
}: {
  social_wallet: string;
  external_wallet: string;
}) => {
  const { error } = await removeSocialWallet({
    artist_address: external_wallet,
  });
  if (error) throw new Error(error.message);
  await migrateApiKey({ from: external_wallet, to: social_wallet });
};

export default disconnectWallets;

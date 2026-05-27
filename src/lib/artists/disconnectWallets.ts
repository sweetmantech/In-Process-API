import deleteWallet from '@/lib/supabase/in_process_wallets/deleteWallet';

const disconnectWallets = async ({
  social_wallet,
}: {
  social_wallet: string;
  external_wallet: string;
}) => {
  await deleteWallet(social_wallet);
};

export default disconnectWallets;

import { Address } from 'viem';
import selectWallets from '@/lib/supabase/in_process_wallets/selectWallets';
import { WalletType } from '@/types/wallets';

const getArtistWalletsHandler = async ({ artistId }: { artistId: string }) => {
  const { data: walletRows } = await selectWallets({ artistIds: [artistId] });
  if (!walletRows?.length) throw new Error('No wallets found for artist');

  return {
    wallets: walletRows.map((w) => ({
      address: w.address as Address,
      type: w.type as WalletType,
    })),
  };
};

export default getArtistWalletsHandler;

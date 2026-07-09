import type { Address } from 'viem';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';
import getPrimaryWallet from '@/lib/wallets/getPrimaryWallet';
import { Tables } from '@/lib/supabase/types';
import type { ArtistContext } from '@/types/artist';
import type { WalletType } from '@/types/wallets';

export interface TelegramArtist extends ArtistContext {
  username: string | null;
}

const getArtistByTelegram = async (
  telegramUsername: string
): Promise<TelegramArtist | null> => {
  const { data } = await selectArtists({ telegram: telegramUsername });
  const row = data?.[0] ?? null;
  if (!row) return null;

  const wallets = (row.wallets ?? []) as Tables<'in_process_wallets'>[];
  const primaryWallet = getPrimaryWallet(wallets);
  if (!primaryWallet) return null;

  return {
    artistId: row.id,
    username: row.username,
    primaryWallet: primaryWallet as Address,
    wallets: wallets.map((w) => ({
      address: w.address as Address,
      type: w.type as WalletType,
    })),
  };
};

export default getArtistByTelegram;

import { supabase } from '@/lib/supabase/client';
import { WalletType } from '@/types/wallets';

const selectWallets = async ({
  addresses,
  artistIds,
  smartWalletAddress,
  type,
}: {
  addresses?: string[];
  artistIds?: string[];
  smartWalletAddress?: string;
  type?: WalletType;
} = {}) => {
  let query = supabase
    .from('in_process_wallets')
    .select(
      'address, artist_id:artist, type, smart_wallet_address, artist:in_process_artists(id, username, bio, x, telegram, instagram)'
    );

  if (addresses?.length) {
    query = query.in(
      'address',
      addresses.map((a) => a.toLowerCase())
    );
  } else if (smartWalletAddress) {
    query = query.eq('smart_wallet_address', smartWalletAddress.toLowerCase());
  } else if (artistIds?.length) {
    query = query.in('artist', artistIds);
    if (type) query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return { data, error };
};

export default selectWallets;

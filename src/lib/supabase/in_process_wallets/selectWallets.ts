import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type WalletType = Database['public']['Enums']['wallet_type'];

const selectWallets = async ({
  address,
  artistId,
  smartWalletAddress,
  type,
}: {
  address?: string;
  artistId?: string;
  smartWalletAddress?: string;
  type?: WalletType;
} = {}) => {
  let query = supabase
    .from('in_process_wallets')
    .select(
      'address, artist, type, smart_wallet_address, in_process_artists(address, username)'
    );

  if (address) query = query.eq('address', address.toLowerCase()).limit(1);
  else if (smartWalletAddress)
    query = query
      .eq('smart_wallet_address', smartWalletAddress.toLowerCase())
      .limit(1);
  else if (artistId) {
    query = query.eq('artist', artistId);
    if (type) query = query.eq('type', type);
    query = query.limit(1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return { data, error };
};

export default selectWallets;

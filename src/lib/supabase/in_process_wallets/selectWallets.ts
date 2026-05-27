import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

type WalletType = Database['public']['Enums']['wallet_type'];

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
      'address, artist, type, smart_wallet_address, in_process_artists(username)'
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

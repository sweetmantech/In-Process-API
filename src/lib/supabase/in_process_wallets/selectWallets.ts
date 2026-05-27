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

  if (address) {
    const { data, error } = await query
      .eq('address', address.toLowerCase())
      .limit(1);
    if (error) throw error;
    return { data, error };
  }

  if (smartWalletAddress) {
    const { data, error } = await query
      .eq('smart_wallet_address', smartWalletAddress.toLowerCase())
      .limit(1);
    if (error) throw error;
    return { data, error };
  }

  if (artistId) {
    let q = query.eq('artist', artistId);
    if (type) q = q.eq('type', type);
    const { data, error } = await q.limit(1);
    if (error) throw error;
    return { data, error };
  }

  const { data, error } = await query;
  if (error) throw error;
  return { data, error };
};

export default selectWallets;

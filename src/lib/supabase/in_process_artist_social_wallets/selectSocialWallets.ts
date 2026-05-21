import { supabase } from '../client';
import { Address } from 'viem';
import type { PostgrestError } from '@supabase/supabase-js';

export async function selectSocialWallets({
  artistAddress,
}: {
  artistAddress: Address;
}): Promise<{
  data: { social_wallet: string }[] | null;
  error: PostgrestError | null;
}> {
  const { error, data } = await supabase
    .from('in_process_artist_social_wallets')
    .select('social_wallet')
    .eq('artist_address', artistAddress.toLowerCase());

  if (error) return { data: null, error };

  return { data, error: null };
}

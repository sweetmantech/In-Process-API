import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

export async function removeSocialWallet({
  social_wallet,
  artist_address,
}: Database['public']['Tables']['in_process_artist_social_wallets']['Update']) {
  let query = supabase.from('in_process_artist_social_wallets').delete();

  if (social_wallet) {
    query = query.eq('social_wallet', social_wallet as string);
  }
  if (artist_address) {
    query = query.eq('artist_address', artist_address as string);
  }

  const { error } = await query;

  if (error) return { error };

  return { error: null };
}

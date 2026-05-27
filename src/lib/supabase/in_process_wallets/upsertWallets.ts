import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/lib/supabase/types';

const upsertWallets = async (
  wallets: Database['public']['Tables']['in_process_wallets']['Insert'][]
): Promise<void> => {
  if (!wallets.length) return;
  const { error } = await supabase
    .from('in_process_wallets')
    .upsert(wallets, { onConflict: 'address' });
  if (error) throw error;
};

export default upsertWallets;

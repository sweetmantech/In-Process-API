import { supabase } from '@/lib/supabase/client';
import { CHAIN_ID } from '@/lib/consts';
import { PostgrestError } from '@supabase/supabase-js';

export async function getInProcessMomentsTotalCnt(): Promise<{
  count: number | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase.rpc('get_moments_total_cnt', {
    p_chain_id: CHAIN_ID,
  });

  return { count: error ? null : (data as number), error };
}

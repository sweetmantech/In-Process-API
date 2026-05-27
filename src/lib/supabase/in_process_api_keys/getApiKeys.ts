import { supabase } from '@/lib/supabase/client';

export async function getApiKeys(artistId: string | null) {
  if (!artistId) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('in_process_api_keys')
    .select('id, name, created_at')
    .eq('artist_id', artistId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error };

  return { data, error: null };
}

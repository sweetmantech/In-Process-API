import { supabase } from '@/lib/supabase/client';

export async function getApiKeys({
  artistId,
  keyHash,
}: {
  artistId?: string | null;
  keyHash?: string;
}) {
  if (!artistId && !keyHash) {
    return { data: [], error: null };
  }

  let query = supabase
    .from('in_process_api_keys')
    .select('id, name, created_at, artist_id')
    .order('created_at', { ascending: false });

  if (artistId) query = query.eq('artist_id', artistId);
  if (keyHash) query = query.eq('key_hash', keyHash);

  const { data, error } = await query;
  if (error) return { data: null, error };

  return { data, error: null };
}

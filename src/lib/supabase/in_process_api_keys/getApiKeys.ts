import { supabase } from '@/lib/supabase/client';

const getApiKeys = async ({
  artistId,
  keyHash,
}: {
  artistId?: string | null;
  keyHash?: string;
}) => {
  if (!artistId && !keyHash) return [];

  let query = supabase
    .from('in_process_api_keys')
    .select('id, name, created_at, artist_id')
    .order('created_at', { ascending: false });

  if (artistId) query = query.eq('artist_id', artistId);
  if (keyHash) query = query.eq('key_hash', keyHash);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

export { getApiKeys };

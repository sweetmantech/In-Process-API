import { supabase } from '@/lib/supabase/client';

export type MediaCacheRow = {
  hash: string;
  path: string;
  created_at: string;
};

const selectExpiredMediaCache = async (
  olderThan: Date,
  limit = 500
): Promise<MediaCacheRow[]> => {
  const { data, error } = await supabase
    .from('in_process_media_cache')
    .select('hash, path, created_at')
    .lt('created_at', olderThan.toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error)
    throw new Error(`Failed to select expired media cache: ${error.message}`);
  return data ?? [];
};

export default selectExpiredMediaCache;

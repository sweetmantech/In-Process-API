import { supabase } from '@/lib/supabase/client';

export type MediaCacheRow = {
  hash: string;
  path: string;
  created_at: string;
};

const selectMediaCache = async ({
  createdBefore,
  limit = 500,
}: {
  createdBefore?: Date;
  limit?: number;
} = {}): Promise<MediaCacheRow[]> => {
  let query = supabase
    .from('in_process_media_cache')
    .select('hash, path, created_at')
    .order('created_at', { ascending: true })
    .limit(limit);

  if (createdBefore) {
    query = query.lt('created_at', createdBefore.toISOString());
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to select media cache: ${error.message}`);
  return data ?? [];
};

export default selectMediaCache;

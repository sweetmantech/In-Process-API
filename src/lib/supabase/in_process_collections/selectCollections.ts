import { supabase } from '../client';

const selectCollections = async ({
  artist,
  chainId,
  limit = 20,
  page = 1,
}: {
  artist?: string;
  chainId?: number;
  limit?: number;
  page?: number;
} = {}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.rpc('get_artist_collections', {
    p_artist: artist?.toLowerCase() ?? null,
    p_chainid: chainId ?? null,
    p_limit: limit,
    p_page: page,
  });

  if (error) return { data: null, count: null, error };

  const result = data;
  return {
    data: result.collections ?? [],
    count: result.total_count ?? 0,
    error: null,
  };
};

export default selectCollections;

import { supabase } from '../client';

type Collection = {
  id: string;
  address: string;
  name: string;
  chain_id: number;
  created_at: string;
  uri: string;
  protocol: string;
  creator: string;
  admins: { artist_address: string; token_id: number }[];
};

type RpcResult = {
  collections: Collection[];
  total_count: number;
};

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
  const { data, error } = await (supabase as any).rpc('get_artist_collections', {
    p_artist: artist?.toLowerCase() ?? null,
    p_chainid: chainId ?? null,
    p_limit: limit,
    p_page: page,
  });

  if (error) return { data: null, count: null, error };

  const result = data as RpcResult;
  return {
    data: result.collections ?? [],
    count: result.total_count ?? 0,
    error: null,
  };
};

export default selectCollections;

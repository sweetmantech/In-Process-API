import { supabase } from '../client';

export type RpcCollection = {
  id: string;
  address: string;
  name: string;
  chain_id: number;
  created_at: string;
  uri: string;
  protocol: string;
  creator: string;
  creator_username: string | null;
  admins: { artist_address: string; token_id: number }[];
};

type RpcResult = {
  collections: RpcCollection[];
  total_count: number;
};

const getCollectionsRpc = async ({
  artist,
  chainId,
  limit = 20,
  page = 1,
  addresses,
}: {
  artist?: string;
  chainId?: number;
  limit?: number;
  page?: number;
  addresses?: string[];
} = {}): Promise<{
  data: RpcCollection[] | null;
  count: number | null;
  error: { message: string } | null;
}> => {
  const { data: rawData, error } = await supabase.rpc('get_collections', {
    p_artist: artist?.toLowerCase(),
    p_chainid: chainId,
    p_limit: limit,
    p_page: page,
    p_addresses: addresses?.map((a) => a.toLowerCase()) ?? undefined,
  });

  if (error) return { data: null, count: null, error };

  const result = rawData as unknown as RpcResult;
  return {
    data: result.collections ?? [],
    count: result.total_count ?? 0,
    error: null,
  };
};

export default getCollectionsRpc;

import { supabase } from '../client';
import { CHAIN_ID } from '@/lib/consts';

const selectCollections = async ({
  collections,
  artists,
  chainId = CHAIN_ID,
  limit = 100,
  page,
}: {
  collections?: { address: string; chainId: number }[];
  artists?: string[];
  chainId?: number;
  limit?: number;
  page?: number;
} = {}) => {
  const cappedLimit = Math.min(limit, 100);

  let query = supabase
    .from('in_process_collections')
    .select(
      `*, creator:in_process_artists!inner(username, address), admins:in_process_admins!inner(artist_address, token_id)`,
      { count: 'exact' }
    );

  if (collections?.length) {
    const orConditions = collections
      .map(
        (c) =>
          `and(address.eq.${c.address.toLowerCase()},chain_id.eq.${c.chainId})`
      )
      .join(',');
    query = query.or(orConditions);
  } else {
    if (chainId) query = query.eq('chain_id', chainId);
  }
  if (artists?.length) query = query.in('creator.address', artists);
  if (page !== undefined) {
    query = query.in('admins.token_id', [0]);
    query = query.range((page - 1) * cappedLimit, page * cappedLimit - 1);
  }
  query = query.order('created_at', { ascending: false });

  const { data, count, error } = await query;
  if (error) return { data: null, count: null, error };
  return { data: data ?? [], count: count ?? 0, error: null };
};

export default selectCollections;

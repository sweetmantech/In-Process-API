import { supabase } from '../client';
import { Moment } from '@/types/moment';

const selectMoments = async ({
  moments,
  artists,
  chainId,
  limit,
}: {
  moments?: Moment[];
  artists?: string[];
  chainId?: number;
  limit?: number;
} = {}) => {
  let query = supabase
    .from('in_process_moments')
    .select(
      '*, collection:in_process_collections!inner(id, address, chain_id, creator, protocol)'
    );

  if (moments?.length) {
    query = query
      .in(
        'collection.address',
        moments.map((m) => m.collectionAddress.toLowerCase())
      )
      .in(
        'token_id',
        moments.map((m) => Number(m.tokenId))
      );
  }

  if (artists) query = query.in('collection.creator', artists);
  if (chainId) query = query.eq('collection.chain_id', chainId);
  if (limit) query = query.limit(limit);
  else query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) return { data: null, error };
  return { data: data ?? [], error: null };
};

export default selectMoments;

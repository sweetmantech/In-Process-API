import { supabase } from '../client';
import { Moment } from '@/types/moment';
import type { Database } from '@/lib/supabase/types';

type MomentRow = Database['public']['Tables']['in_process_moments']['Row'];

export type MomentWithCollection = Omit<MomentRow, 'collection'> & {
  collection: {
    id: string;
    address: string;
    chain_id: number;
    creator: string;
    protocol: string;
  };
};

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
} = {}): Promise<{
  data: MomentWithCollection[] | null;
  error: { message: string } | null;
}> => {
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
  return { data: (data ?? []) as MomentWithCollection[], error: null };
};

export default selectMoments;

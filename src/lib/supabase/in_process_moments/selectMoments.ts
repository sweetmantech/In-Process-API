import { supabase } from '../client';
import { Moment } from '@/types/moment';

const selectMoments = async ({
  moment,
  artists,
  chainId,
}: {
  moment?: Moment;
  artists?: string[];
  chainId?: number;
}) => {
  let query = supabase
    .from('in_process_moments')
    .select(
      '*, collection:in_process_collections!inner(id, address, chain_id, creator)'
    );

  if (moment) {
    const { collectionAddress, chainId, tokenId } = moment;
    if (chainId) {
      query = query.eq('collection.chain_id', chainId);
    }
    if (collectionAddress) {
      query = query.eq('collection.address', collectionAddress.toLowerCase());
    }
    if (tokenId) {
      query = query.eq('token_id', Number(tokenId));
    }
  }

  if (artists) {
    query = query.in('collection.creator', artists);
  }

  if (chainId) {
    query = query.eq('collection.chain_id', chainId);
  }

  query = query.order('created_at', { ascending: false });
  const { data, error } = await query;
  if (error) {
    return { data: null, error };
  }
  return { data: data || [], error: null };
};

export default selectMoments;

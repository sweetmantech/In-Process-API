import { supabase } from '../client';

const selectCollections = async ({
  addresses,
  artist,
  uri,
  chainId,
  limit,
}: {
  addresses?: string[];
  artist?: string;
  uri?: string;
  chainId?: number;
  limit?: number;
} = {}) => {
  let query = supabase.from('in_process_collections').select(
    `*,
      creator_wallet:in_process_wallets!creator(
        artist:in_process_artists(username)
      )`
  );

  if (addresses?.length) {
    query = query.in(
      'address',
      addresses.map((address) => address.toLowerCase())
    );
  }

  if (artist) {
    query = query
      .eq('creator', artist.toLowerCase())
      .eq('protocol', 'in_process');
  }

  if (uri) query = query.eq('uri', uri);
  if (chainId) query = query.eq('chain_id', chainId);
  if (limit) query = query.limit(limit);

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export default selectCollections;

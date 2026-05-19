import { supabase } from '../client';

const selectCollectionIds = async (
  collections: { address: string; chainId: number }[]
) => {
  if (!collections.length) return { data: [], error: null };

  const orConditions = collections
    .map((c) => `and(address.eq.${c.address.toLowerCase()},chain_id.eq.${c.chainId})`)
    .join(',');

  return supabase
    .from('in_process_collections')
    .select('id, address, chain_id')
    .or(orConditions);
};

export default selectCollectionIds;

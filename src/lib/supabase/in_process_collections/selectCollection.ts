import { supabase } from '../client';

const selectCollection = async ({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}) => {
  const { data, error } = await supabase
    .from('in_process_collections')
    .select('*, creator:in_process_artists!inner(username, address)')
    .eq('address', address.toLowerCase())
    .eq('chain_id', chainId)
    .maybeSingle();

  if (error) return { data: null, error };
  return { data, error: null };
};

export default selectCollection;

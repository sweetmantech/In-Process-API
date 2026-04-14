import { supabase } from '../client';

const selectCollectors = async ({
  momentId,
  offset,
}: {
  momentId: string;
  offset: number;
}) => {
  const { data, error } = await supabase
    .from('in_process_transfers')
    .select(
      'id, collector:recipient, amount:quantity, transaction_hash, collected_at:transferred_at, artist:in_process_artists!inner(username)'
    )
    .eq('moment', momentId)
    .order('transferred_at', { ascending: false })
    .range(offset, offset + 14);

  if (error) throw error;
  return data;
};

export default selectCollectors;

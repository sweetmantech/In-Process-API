import { supabase } from '../client';

const selectCollectors = async ({
  momentId,
  offset,
}: {
  momentId: string;
  offset: number;
}) => {
  const { data, error } = await supabase
    .from('in_process_collectors')
    .select(
      'id, collector, amount, transaction_hash, collected_at, artist:in_process_artists!inner(username)'
    )
    .eq('moment', momentId)
    .order('collected_at', { ascending: false })
    .range(offset, offset + 19);

  if (error) throw error;
  return data;
};

export default selectCollectors;

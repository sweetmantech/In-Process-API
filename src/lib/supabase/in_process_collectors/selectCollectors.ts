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
    .select('*, artist:in_process_artists!inner(*)')
    .eq('moment', momentId)
    .order('collected_at', { ascending: false })
    .range(offset, offset + 19);

  if (error) throw error;
  return data;
};

export default selectCollectors;

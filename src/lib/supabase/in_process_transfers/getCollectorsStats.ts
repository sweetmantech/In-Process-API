import { supabase } from '@/lib/supabase/client';
import type { CollectorStats, CollectorsStatsParams } from '@/types/collectors';

const getCollectorsStats = async ({
  period = 'all',
  limit = 20,
  page = 1,
  artist,
  sort_by = 'collected_count',
  sort_order = 'desc',
}: CollectorsStatsParams): Promise<{
  data: CollectorStats[] | null;
  totalCount: number;
}> => {
  const { data, error } = await supabase.rpc('get_collectors_stats', {
    p_period: period,
    p_limit: limit,
    p_page: page,
    p_artist: artist ?? undefined,
    p_sort_by: sort_by,
    p_sort_order: sort_order,
  });

  if (error) throw error;

  const rows = data as (CollectorStats & { total_count: number })[];
  const totalCount = rows[0]?.total_count ?? 0;

  return { data: rows, totalCount };
};

export default getCollectorsStats;

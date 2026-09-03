import { supabase } from '@/lib/supabase/client';
import type {
  ArtistsCollectorsStats,
  ArtistsCollectorsStatsParams,
} from '@/types/artistsCollectorsStats';

const getArtistsCollectorsStats = async ({
  period = 'all',
  limit = 20,
  page = 1,
  artist,
  sort_by = 'total_created_count',
  sort_order = 'desc',
}: ArtistsCollectorsStatsParams): Promise<{
  data: ArtistsCollectorsStats[] | null;
}> => {
  const { data, error } = await supabase.rpc('get_artists_collectors_stats', {
    p_period: period,
    p_limit: limit,
    p_page: page,
    p_artist: artist ?? undefined,
    p_sort_by: sort_by,
    p_sort_order: sort_order,
  });

  if (error) throw error;

  return { data: data as ArtistsCollectorsStats[] | null };
};

export default getArtistsCollectorsStats;

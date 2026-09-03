import { supabase } from '@/lib/supabase/client';
import type {
  ActiveArtistStats,
  ActiveArtistsStatsParams,
} from '@/types/activeArtists';

const getActiveArtistsStats = async ({
  period = 'all',
  limit = 20,
  page = 1,
  artist,
  sort_by = 'created_count',
  sort_order = 'desc',
}: ActiveArtistsStatsParams): Promise<{
  data: ActiveArtistStats[] | null;
}> => {
  const { data, error } = await supabase.rpc('get_active_artists_stats', {
    p_period: period,
    p_limit: limit,
    p_page: page,
    p_artist: artist ?? undefined,
    p_sort_by: sort_by,
    p_sort_order: sort_order,
  });

  if (error) throw error;

  return { data: data as ActiveArtistStats[] | null };
};

export default getActiveArtistsStats;

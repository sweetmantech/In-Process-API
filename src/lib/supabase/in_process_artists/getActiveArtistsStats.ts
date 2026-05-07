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
}: ActiveArtistsStatsParams): Promise<{
  data: ActiveArtistStats[] | null;
  totalCount: number;
  error: Error | null;
}> => {
  const { data, error } = await supabase.rpc('get_active_artists_stats', {
    p_period: period,
    p_limit: limit,
    p_page: page,
    p_artist: artist ?? undefined,
  });

  if (error) {
    return { data: null, totalCount: 0, error };
  }

  const rows = data as (ActiveArtistStats & { total_count: number })[];
  const totalCount = rows[0]?.total_count ?? 0;

  return { data: rows, totalCount, error: null };
};

export default getActiveArtistsStats;

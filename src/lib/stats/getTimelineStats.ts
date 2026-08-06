import { supabase } from '@/lib/supabase/client';

export type TimelineStats = {
  created_count: number;
  eth_archived: string;
  usdc_archived: string;
};

export const emptyTimelineStats: TimelineStats = {
  created_count: 0,
  eth_archived: '0',
  usdc_archived: '0',
};

const getTimelineStats = async (artist: string): Promise<TimelineStats> => {
  try {
    const { data, error } = await supabase.rpc('get_timeline_stats', {
      p_artist: artist.toLowerCase(),
    });

    if (error) throw error;

    const row = data?.[0];
    if (!row) return emptyTimelineStats;

    return {
      created_count: Number(row.created_count ?? 0),
      eth_archived: row.eth_archived ?? '0',
      usdc_archived: row.usdc_archived ?? '0',
    };
  } catch (error) {
    console.error(error);
    return emptyTimelineStats;
  }
};

export default getTimelineStats;

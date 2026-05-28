import { NextResponse } from 'next/server';
import getActiveArtistsStats from '@/lib/supabase/in_process_artists/getActiveArtistsStats';
import type {
  ActiveArtistsSortBy,
  ActiveArtistsSortOrder,
} from '@/types/activeArtists';

const getActiveArtistsHandler = async ({
  period,
  limit,
  page,
  artist,
  sort_by,
  sort_order,
}: {
  period: 'day' | 'week' | 'month' | 'all';
  limit: number;
  page: number;
  artist?: string;
  sort_by: ActiveArtistsSortBy;
  sort_order: ActiveArtistsSortOrder;
}) => {
  const { data, totalCount } = await getActiveArtistsStats({
    period,
    limit,
    page,
    artist,
    sort_by,
    sort_order,
  });

  return NextResponse.json({
    data,
    total_count: totalCount,
    page,
    total_pages: Math.ceil(totalCount / limit),
  });
};

export default getActiveArtistsHandler;

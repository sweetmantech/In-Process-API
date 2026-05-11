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
  const { data, totalCount, error } = await getActiveArtistsStats({
    period,
    limit,
    page,
    artist,
    sort_by,
    sort_order,
  });

  if (error) {
    console.error('Failed to fetch active artists stats', error);
    return NextResponse.json(
      { message: 'Failed to fetch active artists stats' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data,
    total_count: totalCount,
    page,
    total_pages: Math.ceil(totalCount / limit),
  });
};

export default getActiveArtistsHandler;

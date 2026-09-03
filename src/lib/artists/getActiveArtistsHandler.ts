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
  const { data } = await getActiveArtistsStats({
    period,
    limit,
    page,
    artist,
    sort_by,
    sort_order,
  });

  return NextResponse.json({
    artists: data,
    page,
  });
};

export default getActiveArtistsHandler;

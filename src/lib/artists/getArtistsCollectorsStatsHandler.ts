import { NextResponse } from 'next/server';
import getArtistsCollectorsStats from '@/lib/supabase/in_process_artists/getArtistsCollectorsStats';
import type {
  ArtistsCollectorsStatsSortBy,
  ArtistsCollectorsStatsSortOrder,
} from '@/types/artistsCollectorsStats';

const getArtistsCollectorsStatsHandler = async ({
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
  sort_by: ArtistsCollectorsStatsSortBy;
  sort_order: ArtistsCollectorsStatsSortOrder;
}) => {
  const { data } = await getArtistsCollectorsStats({
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

export default getArtistsCollectorsStatsHandler;

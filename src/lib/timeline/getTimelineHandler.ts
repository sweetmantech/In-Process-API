import { NextResponse } from 'next/server';
import getInProcessTimeline from '@/lib/supabase/in_process_moments/getInProcessTimeline';
import getArtistTimeline from '@/lib/supabase/in_process_moments/getArtistTimeline';
import getCollectionTimeline from '@/lib/supabase/in_process_moments/getCollectionTimeline';

interface TimelineParams {
  limit: number;
  page: number;
  collection?: string;
  artist?: string;
  chainId: number | null;
  hidden: boolean;
  mime?: string;
  period?: string;
  channel?: string;
  type?: 'mutual' | 'default';
  curated: boolean;
}

const getTimelineHandler = async ({
  limit,
  page,
  collection,
  artist,
  chainId,
  hidden,
  mime,
  period,
  channel,
  type,
  curated,
}: TimelineParams) => {
  if (collection) {
    const { data, error } = await getCollectionTimeline({
      collection,
      limit,
      page,
      chainId,
      hidden,
      mime,
      period,
      channel,
      artist,
      curated,
    });
    if (error)
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    if (!data)
      return NextResponse.json(
        { status: 'error', message: 'No data returned' },
        { status: 500 }
      );
    return NextResponse.json({
      status: 'success',
      moments: data.moments,
      pagination: data.pagination,
    });
  }

  if (artist) {
    const { data, error } = await getArtistTimeline({
      artist,
      type: type || null,
      limit,
      page,
      chainId,
      hidden,
      mime,
      period,
      channel,
      curated,
    });
    if (error)
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    if (!data)
      return NextResponse.json(
        { status: 'error', message: 'No data returned' },
        { status: 500 }
      );
    return NextResponse.json({
      status: 'success',
      moments: data.moments,
      pagination: data.pagination,
    });
  }

  const { data, error } = await getInProcessTimeline({
    limit,
    page,
    chainId,
    hidden,
    mime,
    period,
    channel,
    curated,
  });
  if (error)
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  if (!data)
    return NextResponse.json(
      { status: 'error', message: 'No data returned' },
      { status: 500 }
    );
  return NextResponse.json({
    status: 'success',
    moments: data.moments,
    pagination: data.pagination,
  });
};

export default getTimelineHandler;

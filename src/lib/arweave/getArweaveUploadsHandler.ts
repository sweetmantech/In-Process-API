import { NextResponse } from 'next/server';
import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';

const PERIOD_INTERVALS: Record<string, number> = {
  day: 1,
  week: 7,
  month: 30,
};

const getArweaveUploadsHandler = async ({
  artist,
  period,
  limit,
  page,
}: {
  artist?: string;
  period?: 'day' | 'week' | 'month' | 'all';
  limit: number;
  page: number;
}) => {
  const days =
    period && period !== 'all' ? PERIOD_INTERVALS[period] : undefined;
  const from = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const { data, count, error } = await selectArweaveUploads({
    artist,
    from,
    limit,
    page,
  });

  if (error) {
    console.error('Failed to fetch arweave uploads', error);
    return NextResponse.json(
      { message: 'Failed to fetch arweave uploads' },
      { status: 500 }
    );
  }

  return NextResponse.json({ uploads: data, count });
};

export default getArweaveUploadsHandler;

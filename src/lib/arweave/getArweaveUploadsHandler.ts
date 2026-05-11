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
  sort_by,
  sort_order,
}: {
  artist?: string;
  period?: 'day' | 'week' | 'month' | 'all';
  limit: number;
  page: number;
  sort_by: 'size' | 'usdc_cost' | 'created_at';
  sort_order: 'asc' | 'desc';
}) => {
  const days =
    period && period !== 'all' ? PERIOD_INTERVALS[period] : undefined;
  const from = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const result = await selectArweaveUploads({
    artist,
    from,
    limit,
    page,
    sortBy: sort_by,
    sortOrder: sort_order,
  });

  if (result.error) {
    console.error('Failed to fetch arweave uploads', result.error);
    return NextResponse.json(
      { message: 'Failed to fetch arweave uploads' },
      { status: 500 }
    );
  }

  const rows = (result.data ?? []) as any[];
  const count = Number(rows[0]?.total_count ?? 0);
  const total_usdc_cost = Number(rows[0]?.total_usdc_cost ?? 0);
  const uploads = rows.map(
    ({
      artist_username,
      artist_address,
      total_count: _c,
      total_usdc_cost: _t,
      ...row
    }) => ({
      ...row,
      artist: { username: artist_username, address: artist_address },
    })
  );

  return NextResponse.json({ uploads, count, total_usdc_cost });
};

export default getArweaveUploadsHandler;

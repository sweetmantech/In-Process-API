import { NextResponse } from 'next/server';
import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';

const PERIOD_INTERVALS: Record<string, number> = {
  day: 1,
  week: 7,
  month: 30,
};

const formatUsdc = (v: unknown) => {
  const n = typeof v === 'string' ? Number(v) : Number(v);
  if (!Number.isFinite(n)) return '0.000000';
  return n.toFixed(6);
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
  sort_by: 'usdc_cost' | 'winc_cost';
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

  const rows = (result.data ?? []) as {
    winc_cost: string;
    usdc_cost: number | string;
    artist_username: string;
    artist_address: string;
    total_count: number | string;
    total_usdc_cost: number | string;
  }[];
  const count = Number(rows[0]?.total_count ?? 0);
  const total_usdc_raw = rows[0]?.total_usdc_cost ?? 0;
  const total_usdc_cost = Number(total_usdc_raw);
  const uploads = rows.map(
    ({ artist_username, artist_address, winc_cost, usdc_cost }) => ({
      winc_cost: String(winc_cost),
      usdc_cost: formatUsdc(usdc_cost),
      artist: { username: artist_username, address: artist_address },
    })
  );

  return NextResponse.json({ uploads, count, total_usdc_cost });
};

export default getArweaveUploadsHandler;

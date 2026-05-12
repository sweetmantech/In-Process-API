import { NextResponse } from 'next/server';
import type { ArweaveLogsQueryInput } from '@/lib/schema/arweaveLogsQuerySchema';
import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';

type GetArweaveUploadsHandlerInput = ArweaveLogsQueryInput & {
  listMode: 'aggregate' | 'detail';
};

type ArweaveRpcRow = Record<string, unknown> & {
  total_count?: number | string;
  total_usdc_cost?: number | string;
};

const PERIOD_INTERVALS: Record<string, number> = {
  day: 1,
  week: 7,
  month: 30,
};

const getArweaveUploadsHandler = async (
  input: GetArweaveUploadsHandlerInput
) => {
  const { listMode, artist, period, limit, page, sort_by, sort_order } = input;
  const days =
    period && period !== 'all' ? PERIOD_INTERVALS[period] : undefined;
  const from = days
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  const result = await selectArweaveUploads({
    rpc:
      listMode === 'detail'
        ? 'get_artist_arweave_uploads'
        : 'get_arweave_uploads',
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

  const rows = (result.data ?? []) as ArweaveRpcRow[];
  const first = rows[0];
  const count = Number(first?.total_count ?? 0);
  const total_usdc_cost = Number(first?.total_usdc_cost ?? 0);
  const uploads = rows.map(
    ({ total_count: _c, total_usdc_cost: _t, ...upload }) => upload
  );

  return NextResponse.json(
    listMode === 'aggregate'
      ? { uploads, count, total_usdc_cost }
      : { uploads, count }
  );
};

export default getArweaveUploadsHandler;

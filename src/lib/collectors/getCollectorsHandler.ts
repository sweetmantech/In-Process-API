import { NextResponse } from 'next/server';
import getCollectorsStats from '@/lib/supabase/in_process_transfers/getCollectorsStats';
import type { CollectorsSortBy, CollectorsSortOrder } from '@/types/collectors';

const getCollectorsHandler = async ({
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
  sort_by: CollectorsSortBy;
  sort_order: CollectorsSortOrder;
}) => {
  const { data, totalCount } = await getCollectorsStats({
    period,
    limit,
    page,
    artist,
    sort_by,
    sort_order,
  });

  return NextResponse.json({
    collectors: data,
    total_count: totalCount,
    page,
    total_pages: Math.ceil(totalCount / limit),
  });
};

export default getCollectorsHandler;

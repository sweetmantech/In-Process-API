import { NextResponse } from 'next/server';
import getCollectorsStats from '@/lib/supabase/in_process_transfers/getCollectorsStats';
import { z } from 'zod';
import collectorsQuerySchema from '@/lib/schema/collectorsQuerySchema';

const getCollectorsHandler = async ({
  period,
  limit,
  page,
  artist,
  sort_by,
  sort_order,
}: z.infer<typeof collectorsQuerySchema>) => {
  const { data } = await getCollectorsStats({
    period,
    limit,
    page,
    artist,
    sort_by,
    sort_order,
  });

  return NextResponse.json({
    collectors: data,
    page,
  });
};

export default getCollectorsHandler;

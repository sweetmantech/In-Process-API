import { NextResponse } from 'next/server';
import { z } from 'zod';
import transfersQuerySchema from '@/lib/schema/transfersQuerySchema';
import getTransfers from '@/lib/transfers/getTransfers';

type TransfersParams = z.infer<typeof transfersQuerySchema>;

const getTransfersHandler = async (params: TransfersParams) => {
  const { data, count } = await getTransfers(params);
  const totalCount = count ?? 0;
  return NextResponse.json({
    transfers: data ?? [],
    pagination: {
      total_count: totalCount,
      page: params.page,
      limit: params.limit,
      total_pages: Math.ceil(totalCount / params.limit),
    },
  });
};

export default getTransfersHandler;

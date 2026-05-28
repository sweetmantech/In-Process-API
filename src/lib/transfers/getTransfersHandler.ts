import { NextResponse } from 'next/server';
import { z } from 'zod';
import transfersQuerySchema from '@/lib/schema/transfersQuerySchema';
import getTransfers from '@/lib/transfers/getTransfers';
import { Transfer_Type } from '@/types/transfer';

type TransfersParams = z.infer<typeof transfersQuerySchema>;

// Reshape the raw Supabase row (which now carries recipient + nested wallet
// joins) back into the { collector: { address, username } } shape that
// clients expect. Airdrop rows come pre-shaped from the RPC, so they skip
// this step.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTransfer(raw: any): any {
  const { recipient, collector, moment: momentField, ...rest } = raw;
  return {
    ...rest,
    collector: {
      address: recipient ?? null,
      username: collector?.artist?.username ?? null,
    },
    moment: momentField ? normalizeTransferMoment(momentField) : momentField,
  };
}

function normalizeTransferMoment(moment: any): any {
  if (!moment?.collection) return moment;
  const { creator, collection_artist, ...collectionRest } = moment.collection;
  return {
    ...moment,
    collection: {
      ...collectionRest,
      artist: {
        address: creator ?? null,
        username: collection_artist?.artist?.username ?? null,
      },
    },
  };
}

const getTransfersHandler = async (params: TransfersParams) => {
  const { data, count } = await getTransfers(params);
  const totalCount = count ?? 0;
  const isAirdrop = params.type === Transfer_Type.airdrop;
  const transfers = isAirdrop
    ? (data ?? [])
    : (data ?? []).map(normalizeTransfer);
  return NextResponse.json({
    transfers,
    pagination: {
      total_count: totalCount,
      page: params.page,
      limit: params.limit,
      total_pages: Math.ceil(totalCount / params.limit),
    },
  });
};

export default getTransfersHandler;

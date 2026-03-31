import { NextResponse } from 'next/server';
import { selectPayments } from '@/lib/supabase/in_process_payments/selectPayments';
import getSmartWalletAddress from '@/lib/smartwallets/getSmartWalletAddress';
import { Address } from 'viem';

interface PaymentsParams {
  limit: number;
  page: number;
  artist?: string;
  collector?: string;
  chainId?: number;
  mime?: string;
}

const getPaymentsHandler = async ({
  limit,
  page,
  artist,
  collector,
  chainId,
  mime,
}: PaymentsParams) => {
  const collectors: string[] = [];
  if (collector) {
    const collectorSmartWallet = await getSmartWalletAddress(
      collector as Address
    );
    collectors.push(collectorSmartWallet);
    collectors.push(collector);
  }

  const artists: string[] = [];
  if (artist) {
    const artistSmartWallet = await getSmartWalletAddress(artist as Address);
    artists.push(artistSmartWallet);
    artists.push(artist);
  }

  const { data, count, error } = await selectPayments({
    limit,
    page,
    artists,
    collectors,
    chainId,
    mime,
  });

  if (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return NextResponse.json({
    status: 'success',
    payments: data || [],
    pagination: {
      total_count: totalCount,
      page,
      limit,
      total_pages: totalPages,
    },
  });
};

export default getPaymentsHandler;

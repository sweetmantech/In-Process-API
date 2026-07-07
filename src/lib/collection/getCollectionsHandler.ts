import { NextResponse } from 'next/server';
import getCollectionsRpc from '@/lib/supabase/in_process_collections/getCollectionsRpc';

interface GetCollectionsInput {
  limit: number;
  page: number;
  artist?: string;
  chain_id: number;
}

const getCollectionsHandler = async ({
  limit,
  page,
  artist,
  chain_id,
}: GetCollectionsInput): Promise<NextResponse> => {
  const {
    data: collections,
    count: collectionsCount,
    error,
  } = await getCollectionsRpc({
    artist,
    chainId: chain_id,
    limit,
    page,
  });

  if (error) {
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    status: 'success',
    collections,
    pagination: {
      page,
      limit,
      total_pages: Math.ceil((collectionsCount || 0) / limit),
    },
  });
};

export default getCollectionsHandler;

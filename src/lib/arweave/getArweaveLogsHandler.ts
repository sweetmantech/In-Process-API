import { NextResponse } from 'next/server';
import { ADMIN_ADDRESSES } from '@/lib/consts';
import selectArweaveUploads from '@/lib/supabase/in_process_arweave_uploads/selectArweaveUploads';

const getArweaveLogsHandler = async ({
  artistAddress,
  limit,
  page,
}: {
  artistAddress: string;
  limit: number;
  page: number;
}) => {
  const isAdmin = ADMIN_ADDRESSES.includes(artistAddress.toLowerCase());

  const { data, count, error } = await selectArweaveUploads({
    artistAddress: isAdmin ? undefined : artistAddress.toLowerCase(),
    limit,
    page,
  });

  if (error) {
    return NextResponse.json(
      { message: 'Failed to fetch arweave logs' },
      { status: 500 }
    );
  }

  return NextResponse.json({ logs: data, count });
};

export default getArweaveLogsHandler;

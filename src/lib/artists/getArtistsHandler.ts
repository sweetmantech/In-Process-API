import { NextResponse } from 'next/server';
import { ADMIN_ADDRESSES } from '@/lib/consts';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';

const getArtistsHandler = async (
  callerAddress: string,
  type: 'human' | 'bot',
  limit?: number,
  page?: number
) => {
  const isAdmin = ADMIN_ADDRESSES.includes(callerAddress.toLowerCase());
  if (!isAdmin) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const resolvedLimit = limit ?? 50;
  const resolvedPage = page ?? 1;

  const { data, count, error } = await selectArtists({
    type,
    limit: resolvedLimit,
    page: resolvedPage,
  });
  if (error) throw new Error(error.message);

  return NextResponse.json({
    status: 'success',
    artists: data,
    pagination: {
      page: resolvedPage,
      limit: resolvedLimit,
      total: count ?? 0,
      total_pages: Math.ceil((count || 0) / resolvedLimit),
    },
  });
};

export default getArtistsHandler;

import { NextResponse } from 'next/server';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';

const searchArtistsHandler = async (query: string, limit: number) => {
  const { data, error } = await selectArtists({ q: query, limit });
  if (error) throw new Error(error.message);

  const artists = (data ?? []).map((a) => ({
    address: a.address,
    username: a.username,
  }));

  return NextResponse.json({ artists });
};

export default searchArtistsHandler;

import { NextResponse } from 'next/server';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';

const searchArtistsHandler = async (query: string, limit: number) => {
  const { data } = await selectArtists({ q: query, limit });

  const artists = (data ?? []).map((a) => ({
    username: a.username,
    wallets: a.wallets,
  }));

  return NextResponse.json({ artists });
};

export default searchArtistsHandler;

import { NextRequest } from 'next/server';
import selectArtists from '@/lib/supabase/in_process_artists/selectArtists';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('query') || '';
  if (!query || query.trim().length === 0) {
    return Response.json(
      { artist: null, error: 'Missing param: query' },
      { status: 400 }
    );
  }
  try {
    const { data: artists, error } = await selectArtists({
      q: query,
      limit: 1,
    });
    if (error) throw error;
    if (artists?.length) {
      return Response.json({ artist: artists[0] });
    }
    return Response.json(
      { artist: null, error: 'Artist not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error searching artists:', error);
    return Response.json(
      { artist: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

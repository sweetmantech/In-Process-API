import { upsertArtists } from '@/lib/supabase/in_process_artists/upsertArtists';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      address,
      username,
      bio,
      instagram_username,
      twitter_username,
      farcaster_username,
      telegram_username,
    } = body;

    await upsertArtists([
      {
        address: address.toLowerCase(),
        username,
        bio,
        twitter_username,
        instagram_username,
        farcaster_username,
        telegram_username,
      },
    ]);

    return Response.json({
      success: true,
    });
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create profile';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

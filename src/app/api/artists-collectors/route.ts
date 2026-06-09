import { NextRequest, NextResponse } from 'next/server';
import validateArtistsCollectorsStatsQuery from '@/lib/artists/validateArtistsCollectorsStatsQuery';
import getArtistsCollectorsStatsHandler from '@/lib/artists/getArtistsCollectorsStatsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateArtistsCollectorsStatsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getArtistsCollectorsStatsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import validateActiveArtistsQuery from '@/lib/artists/validateActiveArtistsQuery';
import getActiveArtistsHandler from '@/lib/artists/getActiveArtistsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateActiveArtistsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getActiveArtistsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

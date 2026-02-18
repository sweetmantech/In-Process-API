import { NextRequest, NextResponse } from 'next/server';
import validateArtistsQuery from '@/lib/artists/validateArtistsQuery';
import getArtistsHandler from '@/lib/artists/getArtistsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateArtistsQuery(req);
    if (validated instanceof NextResponse) return validated;
    const { callerAddress, type, limit, page } = validated;
    return await getArtistsHandler(callerAddress, type, limit, page);
  } catch (e: any) {
    const message = e?.message ?? 'Failed to fetch artists';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

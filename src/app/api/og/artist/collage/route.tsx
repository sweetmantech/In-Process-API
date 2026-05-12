import { NextRequest, NextResponse } from 'next/server';
import validateArtistCollageQuery from '@/lib/og/validateArtistCollageQuery';
import getArtistCollageHandler from '@/lib/og/getArtistCollageHandler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const validated = validateArtistCollageQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getArtistCollageHandler(validated);
  } catch (error: unknown) {
    console.error('Error rendering OG artist collage:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to render OG artist collage';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

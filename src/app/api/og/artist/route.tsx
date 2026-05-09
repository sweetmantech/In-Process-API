import { NextRequest, NextResponse } from 'next/server';
import validateOgArtistQuery from '@/lib/og/validateOgArtistQuery';
import getOgArtistHandler from '@/lib/og/getOgArtistHandler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const validated = validateOgArtistQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getOgArtistHandler(validated);
  } catch (error: unknown) {
    console.error('Error rendering OG artist image:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to render OG artist image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

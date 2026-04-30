import { NextRequest, NextResponse } from 'next/server';
import validateOgMomentQuery from '@/lib/og/validateOgMomentQuery';
import getOgMomentHandler from '@/lib/og/getOgMomentHandler';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const validated = validateOgMomentQuery(req);
    if (validated instanceof NextResponse) return validated;
    return await getOgMomentHandler(validated);
  } catch (error: unknown) {
    console.error('Error rendering OG moment image:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to render OG moment image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

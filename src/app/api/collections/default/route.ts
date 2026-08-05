import { NextRequest, NextResponse } from 'next/server';
import validateCreateDefaultCollection from '@/lib/collection/validateCreateDefaultCollection';
import createCollectionHandler from '@/lib/collection/createCollectionHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateDefaultCollection(req);
    if (validated instanceof NextResponse) return validated;
    return createCollectionHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to create default collection' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

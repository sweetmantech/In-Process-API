import { NextRequest, NextResponse } from 'next/server';
import validateCreateDefaultCollection from '@/lib/collection/validateCreateDefaultCollection';
import createDefaultCollectionHandler from '@/lib/collection/createDefaultCollectionHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateDefaultCollection(req);
    if (validated instanceof NextResponse) return validated;
    return createDefaultCollectionHandler(validated);
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

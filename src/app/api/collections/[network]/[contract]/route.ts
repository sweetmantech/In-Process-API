import { NextRequest, NextResponse } from 'next/server';
import validateGetCollectionCAIPParams from '@/lib/collection/validateGetCollectionCAIPParams';
import getCollectionHandler from '@/lib/collection/getCollectionHandler';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ network: string; contract: string }> }
) {
  try {
    const validated = validateGetCollectionCAIPParams(await params);
    if (validated instanceof NextResponse) return validated;
    return getCollectionHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to get collection' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

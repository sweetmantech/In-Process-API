import { NextRequest, NextResponse } from 'next/server';
import validateGetCollectionCAIPParams from '@/lib/collection/validateGetCollectionCAIPParams';
import getCollectionHandler from '@/lib/collection/getCollectionHandler';
import validateUpdateCollectionURICAIP from '@/lib/collection/validateUpdateCollectionURICAIP';
import updateCollectionURIHandler from '@/lib/collection/updateCollectionURIHandler';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ network: string; contract: string }> }
) {
  try {
    const validated = await validateUpdateCollectionURICAIP(req, await params);
    if (validated instanceof NextResponse) return validated;
    return updateCollectionURIHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

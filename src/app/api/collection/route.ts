import { NextRequest, NextResponse } from 'next/server';
import validateUpdateCollectionURI from '@/lib/collection/validateUpdateCollectionURI';
import updateCollectionURIHandler from '@/lib/collection/updateCollectionURIHandler';

export async function PATCH(req: NextRequest) {
  try {
    const validated = await validateUpdateCollectionURI(req);
    if (validated instanceof Response) return validated;
    return await updateCollectionURIHandler(validated);
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

import { NextRequest } from 'next/server';
import validateUpdateCollectionURI from '@/lib/collection/validateUpdateCollectionURI';
import updateCollectionURIHandler from '@/lib/collection/updateCollectionURIHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateUpdateCollectionURI(req);
    if (validated instanceof Response) return validated;
    return await updateCollectionURIHandler(validated);
  } catch (e: any) {
    return Response.json(
      { message: e?.message ?? 'failed to update collection URI' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

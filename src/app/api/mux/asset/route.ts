import { NextRequest, NextResponse } from 'next/server';
import validateMuxAssetQuery from '@/lib/mux/validateMuxAssetQuery';
import getMuxAssetHandler from '@/lib/mux/getMuxAssetHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateMuxAssetQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getMuxAssetHandler(validated.uploadId);
  } catch (e: any) {
    const message = e?.message ?? 'failed to get upload info';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import validateGetCollectionsQuery from '@/lib/collection/validateGetCollectionsQuery';
import getCollectionsHandler from '@/lib/collection/getCollectionsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateGetCollectionsQuery(req);
    if (!validated)
      return NextResponse.json(
        { message: 'Invalid query params' },
        { status: 400 }
      );
    return getCollectionsHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

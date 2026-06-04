import { NextRequest, NextResponse } from 'next/server';
import validateCollectorsQuery from '@/lib/collectors/validateCollectorsQuery';
import getCollectorsHandler from '@/lib/collectors/getCollectorsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateCollectorsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getCollectorsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

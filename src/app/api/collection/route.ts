import { NextRequest, NextResponse } from 'next/server';
import validateGetCollectionQuery from '@/lib/collection/validateGetCollectionQuery';
import getCollectionHandler from '@/lib/collection/getCollectionHandler';
import validateCreateCollectionBody from '@/lib/collection/validateCreateCollectionBody';
import createCollectionHandler from '@/lib/collection/createCollectionHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = validateGetCollectionQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getCollectionHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateCollectionBody(req);
    if (validated instanceof NextResponse) return validated;
    return createCollectionHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to create collection' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

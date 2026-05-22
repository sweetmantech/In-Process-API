import { NextRequest, NextResponse } from 'next/server';
import validateGetCollectionsQuery from '@/lib/collection/validateGetCollectionsQuery';
import getCollectionsHandler from '@/lib/collection/getCollectionsHandler';
import validateCreateCollectionsBody from '@/lib/collection/validateCreateCollectionsBody';
import createCollectionsHandler from '@/lib/collection/createCollectionsHandler';

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

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateCollectionsBody(req);
    if (validated instanceof NextResponse) return validated;
    return createCollectionsHandler(validated);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Failed to create collections' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

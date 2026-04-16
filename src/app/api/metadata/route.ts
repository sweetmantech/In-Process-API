import { NextRequest, NextResponse } from 'next/server';
import validateMetadataQuery from '@/lib/metadata/validateMetadataQuery';
import getMetadataHandler from '@/lib/metadata/getMetadataHandler';

export async function POST(req: NextRequest) {
  const validated = await validateMetadataQuery(req);
  if (validated instanceof NextResponse) return validated;

  try {
    const data = await getMetadataHandler(validated);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'failed to get metadata' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import validateGetArweaveUploadsQuery from '@/lib/arweave/validateGetArweaveUploadsQuery';
import getArweaveUploadsHandler from '@/lib/arweave/getArweaveUploadsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateGetArweaveUploadsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getArweaveUploadsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

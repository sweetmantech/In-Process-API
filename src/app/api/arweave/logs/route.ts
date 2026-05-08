import { NextRequest, NextResponse } from 'next/server';
import validateGetArweaveLogsQuery from '@/lib/arweave/validateGetArweaveLogsQuery';
import getArweaveLogsHandler from '@/lib/arweave/getArweaveLogsHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateGetArweaveLogsQuery(req);
    if (validated instanceof NextResponse) return validated;
    return getArweaveLogsHandler(validated);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

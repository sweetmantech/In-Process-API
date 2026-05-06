import { NextRequest, NextResponse } from 'next/server';
import validateLogArweaveUpload from '@/lib/arweave/validateLogArweaveUpload';
import logArweaveUploadsHandler from '@/lib/arweave/logArweaveUploadsHandler';
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

export async function POST(req: NextRequest) {
  try {
    const validated = await validateLogArweaveUpload(req);
    if (validated instanceof NextResponse) return validated;

    const { artistAddress, uploads } = validated;
    return logArweaveUploadsHandler(artistAddress, uploads);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

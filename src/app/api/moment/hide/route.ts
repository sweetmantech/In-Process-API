import { NextRequest, NextResponse } from 'next/server';
import validateHideMomentBody from '@/lib/moment/validateHideMomentBody';
import hideMomentHandler from '@/lib/moment/hideMomentHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateHideMomentBody(req);
    if (validated instanceof NextResponse) return validated;
    return hideMomentHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to hide tokens';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

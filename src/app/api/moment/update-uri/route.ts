import { NextRequest, NextResponse } from 'next/server';
import validateUpdateMomentURI from '@/lib/moment/validateUpdateMomentURI';
import updateMomentURIHandler from '@/lib/moment/updateMomentURIHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateUpdateMomentURI(req);
    if (validated instanceof NextResponse) return validated;
    return updateMomentURIHandler(validated);
  } catch (e: any) {
    const message = e?.message ?? 'failed to update moment URI';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

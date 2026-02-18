import { NextRequest, NextResponse } from 'next/server';
import validateUpdateSaleBody from '@/lib/moment/validateUpdateSaleBody';
import updateSaleHandler from '@/lib/moment/updateSaleHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateUpdateSaleBody(req);
    if (validated instanceof NextResponse) return validated;
    return await updateSaleHandler(validated);
  } catch (e: any) {
    const message = e?.message ?? 'Failed to update sale';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

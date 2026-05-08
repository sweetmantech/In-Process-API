import { NextRequest, NextResponse } from 'next/server';
import validateAirdropMoment from '@/lib/moment/validateAirdropMoment';
import airdropMomentHandler from '@/lib/moment/airdropMomentHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateAirdropMoment(req);
    if (validated instanceof NextResponse) return validated;
    return airdropMomentHandler(validated);
  } catch (e: any) {
    const message = e?.message ?? 'Airdrop failed.';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

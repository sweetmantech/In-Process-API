import { NextRequest, NextResponse } from 'next/server';
import validateCreateProfileBody from '@/lib/artists/validateCreateProfileBody';
import createProfileHandler from '@/lib/artists/createProfileHandler';

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateProfileBody(req);
    if (validated instanceof NextResponse) return validated;
    return createProfileHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to create profile';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

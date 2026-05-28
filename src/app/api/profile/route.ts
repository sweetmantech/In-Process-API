import { NextRequest, NextResponse } from 'next/server';
import { Address } from 'viem';
import getArtistProfile from '@/lib/artists/getArtistProfile';
import validateCreateProfileBody from '@/lib/artists/validateCreateProfileBody';
import createProfileHandler from '@/lib/artists/createProfileHandler';

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get('address');
    const profile = await getArtistProfile((address as Address).toLowerCase());
    return Response.json(profile);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'failed to get profile.';
    return Response.json({ message }, { status: 500 });
  }
}

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

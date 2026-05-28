import { NextRequest, NextResponse } from 'next/server';
import validateArtistApiKeysGet from '@/lib/artists/validateArtistApiKeysGet';
import getArtistApiKeysHandler from '@/lib/artists/getArtistApiKeysHandler';
import validateCreateArtistApiKeyBody from '@/lib/artists/validateCreateArtistApiKeyBody';
import createArtistApiKeyHandler from '@/lib/artists/createArtistApiKeyHandler';
import validateDeleteArtistApiKeyQuery from '@/lib/artists/validateDeleteArtistApiKeyQuery';
import deleteArtistApiKeyHandler from '@/lib/artists/deleteArtistApiKeyHandler';

export async function GET(req: NextRequest) {
  try {
    const validated = await validateArtistApiKeysGet(req);
    if (validated instanceof NextResponse) return validated;
    return getArtistApiKeysHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to get API keys';
    return Response.json({ message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const validated = await validateCreateArtistApiKeyBody(req);
    if (validated instanceof NextResponse) return validated;
    return createArtistApiKeyHandler(validated);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to create an api key';
    return Response.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const validated = await validateDeleteArtistApiKeyQuery(req);
    if (validated instanceof NextResponse) return validated;
    const { keyId } = validated;
    return deleteArtistApiKeyHandler(keyId);
  } catch (e: any) {
    console.log(e);
    const message = e?.message ?? 'Failed to delete an API key';
    return Response.json({ message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

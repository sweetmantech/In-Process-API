import { NextRequest, NextResponse } from 'next/server';
import { getBearerToken } from '@/lib/api-keys/getBearerToken';
import privyClient from '@/lib/privy/client';

const validateDeleteArtistApiKeyQuery = async (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  const authToken = getBearerToken(authHeader);
  if (!authToken) {
    return NextResponse.json(
      { message: 'Authorization header with Bearer token required' },
      { status: 500 }
    );
  }

  try {
    await privyClient.utils().auth().verifyAuthToken(authToken);
  } catch (e: any) {
    const message = e?.message ?? 'Failed to delete API key';
    return NextResponse.json({ message }, { status: 500 });
  }

  const keyId = req.nextUrl.searchParams.get('keyId');
  if (!keyId) {
    return NextResponse.json(
      { message: 'keyId parameter required' },
      { status: 400 }
    );
  }

  return { keyId };
};

export default validateDeleteArtistApiKeyQuery;

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

const validateArtistApiKeysGet = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  if (!authResult.artistAddress) {
    return NextResponse.json(
      { message: 'No artist address found for this API key' },
      { status: 500 }
    );
  }

  return { artistAddress: authResult.artistAddress.toLowerCase() };
};

export default validateArtistApiKeysGet;

import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';

const validateArtistApiKeysGet = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const { artistId } = authResult;
  return { artistId };
};

export default validateArtistApiKeysGet;

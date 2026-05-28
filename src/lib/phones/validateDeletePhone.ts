import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import type { ArtistContext } from '@/types/artist';

export type DeletePhoneInput = {
  artist: ArtistContext;
};

const validateDeletePhone = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  return { artist: authResult };
};

export default validateDeletePhone;

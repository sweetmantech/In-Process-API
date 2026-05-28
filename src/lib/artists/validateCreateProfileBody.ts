import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import createProfileSchema from '@/lib/schema/createProfileSchema';
import type { ArtistContext } from '@/types/artist';

export type CreateProfileInput = {
  artist: ArtistContext;
} & z.infer<typeof createProfileSchema>;

const validateCreateProfileBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(createProfileSchema, body);
  if (!result.success) return result.response;

  return {
    artist: authResult,
    ...result.data,
  };
};

export default validateCreateProfileBody;

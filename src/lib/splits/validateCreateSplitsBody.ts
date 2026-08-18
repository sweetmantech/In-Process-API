import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { createSplitsSchema } from '@/lib/schema/createSplitsSchema';
import type { ArtistContext } from '@/types/artist';

export type CreateSplitsBody = { artist: ArtistContext } & z.infer<
  typeof createSplitsSchema
>;

const validateCreateSplitsBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const body = await req.json();
  const result = validate(createSplitsSchema, body);
  if (!result.success) return result.response;

  return { artist: authResult, ...result.data };
};

export default validateCreateSplitsBody;

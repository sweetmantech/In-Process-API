import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { registerPhoneSchema } from '@/lib/schema/phoneNumberSchema';
import type { ArtistContext } from '@/types/artist';

export type RegisterPhoneInput = {
  artist: ArtistContext;
} & z.infer<typeof registerPhoneSchema>;

const validateRegisterPhoneBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(registerPhoneSchema, body);
  if (!result.success) return result.response;

  return {
    artist: authResult,
    ...result.data,
  };
};

export default validateRegisterPhoneBody;

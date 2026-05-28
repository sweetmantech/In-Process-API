import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { withdrawSchema } from '@/lib/schema/withdrawSchema';

export type WithdrawValidatedInput = {
  artistId: string;
} & z.infer<typeof withdrawSchema>;

const validateWithdrawBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(withdrawSchema, body);
  if (!result.success) return result.response;

  return {
    artistId: authResult.artistId,
    ...result.data,
  };
};

export default validateWithdrawBody;

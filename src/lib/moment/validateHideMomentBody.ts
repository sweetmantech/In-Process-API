import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import hideMomentSchema from '@/lib/schema/hideMomentSchema';
import type { Address } from 'viem';

const validateHideMomentBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(hideMomentSchema, body);
  if (!result.success) return result.response;

  return { ...authResult, ...result.data };
};

export default validateHideMomentBody;

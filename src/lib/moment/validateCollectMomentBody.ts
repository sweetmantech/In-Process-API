import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { collectSchema } from '@/lib/schema/collectSchema';
import type { Address } from 'viem';

const validateCollectMomentBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;

  const body = await req.json();
  const result = validate(collectSchema, body);
  if (!result.success) return result.response;

  return {
    artistAddress: authResult.primaryWallet as Address,
    ...result.data,
  };
};

export default validateCollectMomentBody;

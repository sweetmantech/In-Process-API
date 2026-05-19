import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CHAIN_ID } from '@/lib/consts';

const getCollectionQuerySchema = z.object({
  collectionAddress: z
    .string()
    .min(1, 'collectionAddress parameter is required')
    .toLowerCase(),
  chainId: z.coerce.number().int().default(CHAIN_ID),
});

const validateGetCollectionQuery = (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = getCollectionQuerySchema.safeParse(params);
  if (!result.success)
    return NextResponse.json(
      {
        status: 'error',
        message: result.error.issues[0]?.message ?? 'Invalid query params',
      },
      { status: 400 }
    );
  return result.data;
};

export default validateGetCollectionQuery;

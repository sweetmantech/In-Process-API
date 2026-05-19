import { NextRequest } from 'next/server';
import { z } from 'zod';
import { CHAIN_ID } from '@/lib/consts';

const getCollectionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(100),
  page: z.coerce.number().int().min(1).default(1),
  artist: z.string().toLowerCase().optional(),
  chain_id: z.coerce.number().int().default(CHAIN_ID),
});

const validateGetCollectionsQuery = (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = getCollectionsQuerySchema.safeParse(params);
  if (!result.success) return null;
  return result.data;
};

export default validateGetCollectionsQuery;

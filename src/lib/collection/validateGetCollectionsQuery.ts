import { NextRequest } from 'next/server';
import collectionsQuerySchema from '@/lib/schema/collectionsQuerySchema';

const validateGetCollectionsQuery = (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = collectionsQuerySchema.safeParse(params);
  if (!result.success) return null;
  return result.data;
};

export default validateGetCollectionsQuery;

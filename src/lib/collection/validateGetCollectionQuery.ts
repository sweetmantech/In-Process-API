import { NextRequest, NextResponse } from 'next/server';
import collectionQuerySchema from '@/lib/schema/collectionQuerySchema';

const validateGetCollectionQuery = (req: NextRequest) => {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = collectionQuerySchema.safeParse(params);
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

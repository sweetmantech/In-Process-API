import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import arweaveLogsQuerySchema from '@/lib/schema/arweaveLogsQuerySchema';

const validateGetArweaveLogsQuery = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof NextResponse) return authResult;
  const { artistAddress } = authResult;

  const result = arweaveLogsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid query parameters', errors: result.error.issues },
      { status: 400 }
    );
  }

  return { artistAddress, ...result.data };
};

export default validateGetArweaveLogsQuery;

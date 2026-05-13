import { NextRequest, NextResponse } from 'next/server';
import arweaveLogsQuerySchema from '@/lib/schema/arweaveLogsQuerySchema';

const validateGetArweaveUploadsQuery = (req: NextRequest) => {
  const result = arweaveLogsQuerySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );

  if (!result.success) {
    return NextResponse.json(
      { message: 'Invalid query parameters', errors: result.error.issues },
      { status: 400 }
    );
  }

  return result.data;
};

export default validateGetArweaveUploadsQuery;

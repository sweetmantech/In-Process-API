import { NextRequest, NextResponse } from 'next/server';
import transfersQuerySchema from '@/lib/schema/transfersQuerySchema';

const validateTransfersQuery = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const result = transfersQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!result.success) {
    return NextResponse.json(
      { message: result.error.issues[0].message },
      { status: 400 }
    );
  }
  return result.data;
};

export default validateTransfersQuery;

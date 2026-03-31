import { NextRequest, NextResponse } from 'next/server';
import paymentsQuerySchema from '@/lib/schema/paymentsQuerySchema';

const validatePaymentsQuery = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const result = paymentsQuerySchema.safeParse(
    Object.fromEntries(searchParams)
  );
  if (!result.success) {
    return NextResponse.json(
      { status: 'error', message: result.error.issues[0].message },
      { status: 400 }
    );
  }
  return result.data;
};

export default validatePaymentsQuery;

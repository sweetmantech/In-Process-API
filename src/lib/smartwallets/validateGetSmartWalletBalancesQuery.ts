import { NextRequest, NextResponse } from 'next/server';
import { getSmartWalletBalancesSchema } from '@/lib/schema/getSmartWalletBalancesSchema';

const validateGetSmartWalletBalancesQuery = (req: NextRequest) => {
  const { searchParams } = req.nextUrl;
  const result = getSmartWalletBalancesSchema.safeParse({
    artistId: searchParams.get('artistId'),
    chainId: searchParams.get('chainId'),
  });
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return NextResponse.json(
      { message: 'Invalid input', errors },
      { status: 400 }
    );
  }
  return result.data;
};

export default validateGetSmartWalletBalancesQuery;

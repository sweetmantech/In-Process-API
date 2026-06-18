import { NextRequest } from 'next/server';
import { getSmartWalletSchema } from '@/lib/schema/getSmartWalletSchema';
import { validate } from '@/lib/schema/validate';

const validateGetSmartWalletQuery = (req: NextRequest) => {
  const queryParams = {
    accountId: req.nextUrl.searchParams.get('accountId') ?? undefined,
    walletAddress: req.nextUrl.searchParams.get('walletAddress') ?? undefined,
  };
  const result = validate(getSmartWalletSchema, queryParams);
  if (!result.success) return result.response;

  return result.data;
};

export default validateGetSmartWalletQuery;

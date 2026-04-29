import { NextRequest } from 'next/server';
import { getSmartWalletSchema } from '@/lib/schema/getSmartWalletSchema';
import { validate } from '@/lib/schema/validate';

const validateGetSmartWalletQuery = (req: NextRequest) => {
  const queryParams = {
    artist_wallet: req.nextUrl.searchParams.get('artist_wallet'),
  };
  const result = validate(getSmartWalletSchema, queryParams);
  if (!result.success) return result.response;

  return result.data;
};

export default validateGetSmartWalletQuery;

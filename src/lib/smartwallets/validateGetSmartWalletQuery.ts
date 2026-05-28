import { NextRequest } from 'next/server';
import { getSmartWalletSchema } from '@/lib/schema/getSmartWalletSchema';
import { validate } from '@/lib/schema/validate';

const validateGetSmartWalletQuery = (req: NextRequest) => {
  const queryParams = {
    artistId: req.nextUrl.searchParams.get('artistId'),
  };
  const result = validate(getSmartWalletSchema, queryParams);
  if (!result.success) return result.response;

  return result.data;
};

export default validateGetSmartWalletQuery;

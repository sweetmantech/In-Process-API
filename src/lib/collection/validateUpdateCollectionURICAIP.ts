import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { updateCollectionURIBodySchema } from '@/lib/schema/updateCollectionURIBodySchema';
import validateGetCollectionCAIPParams from '@/lib/collection/validateGetCollectionCAIPParams';

const validateUpdateCollectionURICAIP = async (
  req: NextRequest,
  params: { network: string; contract: string }
) => {
  const caip = validateGetCollectionCAIPParams(params);
  if (caip instanceof NextResponse) return caip;
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const body = await req.json();
  const result = validate(updateCollectionURIBodySchema, body);
  if (!result.success) return result.response;
  return {
    artist: authResult,
    collection: { address: caip.collectionAddress, chainId: caip.chainId },
    ...result.data,
  };
};

export default validateUpdateCollectionURICAIP;

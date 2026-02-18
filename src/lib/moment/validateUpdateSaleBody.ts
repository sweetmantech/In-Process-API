import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '@/lib/schema/validate';
import { updateSaleSchema } from '@/lib/schema/updateSaleSchema';

const validateUpdateSaleBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { artistAddress: callerAddress } = authResult;

  const body = await req.json();
  const result = validate(updateSaleSchema, body);
  if (!result.success) return result.response;

  return { callerAddress, ...result.data };
};

export default validateUpdateSaleBody;

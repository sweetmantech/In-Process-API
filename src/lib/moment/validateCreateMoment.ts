import { NextRequest, NextResponse } from 'next/server';
import {
  createMomentSchema,
  type CreateMomentContractInput,
} from '@/lib/schema/createMomentSchema';
import { validate } from '@/lib/schema/validate';
import getChannelFromReqHeader from '@/lib/moment/getChannelFromReqHeader';

const validateCreateMoment = async (
  req: NextRequest
): Promise<CreateMomentContractInput | NextResponse> => {
  const body = await req.json();
  const validationResult = validate(createMomentSchema, body);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const data = validationResult.data;
  return {
    ...data,
    channel: data.channel ?? getChannelFromReqHeader(req),
  };
};

export default validateCreateMoment;

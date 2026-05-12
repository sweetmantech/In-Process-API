import { NextRequest } from 'next/server';
import { createMomentBatchSchema } from '@/lib/schema/createMomentSchema';
import { validate } from '@/lib/schema/validate';
import getChannelFromReqHeader from '@/lib/moment/getChannelFromReqHeader';

const validateCreateMomentBatch = async (req: NextRequest) => {
  const body = await req.json();
  const validationResult = validate(createMomentBatchSchema, body);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const data = validationResult.data;
  return {
    ...data,
    channel: data.channel ?? getChannelFromReqHeader(req),
  };
};

export default validateCreateMomentBatch;

import { NextRequest, NextResponse } from 'next/server';
import {
  createWritingMomentSchema,
  type CreateWritingMomentInput,
} from '@/lib/schema/createMomentSchema';
import { validate } from '@/lib/schema/validate';

const validateCreateWritingMoment = async (
  req: NextRequest
): Promise<CreateWritingMomentInput | NextResponse> => {
  const body = await req.json();
  const validationResult = validate(createWritingMomentSchema, body);
  if (!validationResult.success) {
    return validationResult.response;
  }
  return validationResult.data;
};

export default validateCreateWritingMoment;

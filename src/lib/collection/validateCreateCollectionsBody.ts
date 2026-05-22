import { NextRequest, NextResponse } from 'next/server';
import { createCollectionsSchema } from '@/lib/schema/createCollectionsSchema';
import { validate } from '@/lib/schema/validate';

const validateCreateCollectionsBody = async (req: NextRequest) => {
  const body = await req.json();
  const result = validate(createCollectionsSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateCreateCollectionsBody;

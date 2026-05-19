import { NextRequest, NextResponse } from 'next/server';
import { createCollectionSchema } from '@/lib/schema/createCollectionSchema';
import { validate } from '@/lib/schema/validate';

const validateCreateCollectionBody = async (req: NextRequest) => {
  const body = await req.json();
  const result = validate(createCollectionSchema, body);
  if (!result.success) return result.response as NextResponse;
  return result.data;
};

export default validateCreateCollectionBody;

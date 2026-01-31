import { validate } from '@/lib/schema/validate';
import { messageIdSchema } from '@/lib/schema/messageSchema';
import { NextRequest, NextResponse } from 'next/server';

export const validateMessageIdBody = async (request: NextRequest) => {
  const body = await request.json();
  const validationResult = validate(messageIdSchema, body);
  if (!validationResult.success) {
    return validationResult.response;
  }

  return validationResult.data;
};

import { validate } from '@/lib/schema/validate';
import { messageIdSchema } from '@/lib/schema/messageSchema';
import { NextRequest } from 'next/server';

export const validateMessageIdParam = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const queryParams = {
    messageId: searchParams.get('messageId'),
  };

  const validationResult = validate(messageIdSchema, queryParams);
  if (!validationResult.success) {
    return validationResult.response;
  }

  return validationResult.data;
};

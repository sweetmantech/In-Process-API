import { getMessagesSchema } from '@/lib/schema/getMessagesSchema';
import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { validate } from '../schema/validate';

export const validateMessagesParam = async (request: NextRequest) => {
  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { artistAddress } = authResult;

  const { searchParams } = new URL(request.url);

  const queryParams = {
    messageId: searchParams.get('messageId') ?? undefined,
    moment: searchParams.get('moment') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
  };

  const validationResult = validate(getMessagesSchema, queryParams);
  if (!validationResult.success) {
    return validationResult.response;
  }

  return {
    ...validationResult.data,
    artistAddress: artistAddress.toLowerCase(),
  };
};

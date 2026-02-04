import { audioStreamSchema } from '@/lib/schema/audioStreamSchema';
import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';

export const validateAudioStreamParam = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const queryParams = {
    url: searchParams.get('url') ?? undefined,
  };

  const validationResult = validate(audioStreamSchema, queryParams);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const rangeHeader = request.headers.get('range');

  return {
    ...validationResult.data,
    rangeHeader,
  };
};

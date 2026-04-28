import { mediaStreamSchema } from '@/lib/schema/mediaStreamSchema';
import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/schema/validate';

export const validateMediaStream = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const queryParams = {
    url: searchParams.get('url') ?? undefined,
    proxy: searchParams.get('proxy') ?? undefined,
  };

  const validationResult = validate(mediaStreamSchema, queryParams);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const { url, proxy: useProxy } = validationResult.data;
  const rangeHeader = request.headers.get('range');

  return {
    uri: url,
    rangeHeader,
    useProxy,
  };
};

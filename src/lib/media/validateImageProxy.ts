import { imageProxySchema } from '@/lib/schema/imageProxySchema';
import { NextRequest } from 'next/server';
import { validate } from '@/lib/schema/validate';

export const validateImageProxy = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const queryParams = {
    url: searchParams.get('url') ?? undefined,
    w: searchParams.get('w') ?? undefined,
    h: searchParams.get('h') ?? undefined,
    q: searchParams.get('q') ?? undefined,
    f: searchParams.get('f') ?? undefined,
  };

  const validationResult = validate(imageProxySchema, queryParams);
  if (!validationResult.success) {
    return validationResult.response;
  }

  const { url, w, h, q, f } = validationResult.data;

  return {
    url,
    width: w,
    height: h,
    quality: q,
    format: f,
  };
};

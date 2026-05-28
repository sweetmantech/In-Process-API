import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/authMiddleware';
import { createApiKeySchema } from '@/lib/schema/apiKeySchema';
import { validate } from '@/lib/schema/validate';

const validateCreateArtistApiKeyBody = async (req: NextRequest) => {
  const authResult = await authMiddleware(req);
  if (authResult instanceof Response) return authResult as NextResponse;
  const { artistId } = authResult;

  const body = await req.json();
  const result = validate(createApiKeySchema, body);
  if (!result.success) return result.response;

  return {
    artistId,
    key_name: result.data.key_name,
  };
};

export default validateCreateArtistApiKeyBody;
